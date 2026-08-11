import { Request, Response, NextFunction } from 'express';
import { loginUseCase } from '../use-cases/auth/login.usecase';
import { firstLoginUseCase } from '../use-cases/auth/first-login.usecase';
import { UserRepository } from '../repositories/usuarios.repository';
import { updateUser } from '../use-cases/usuarios/listar-usuarios.usecase';
import { logCambioDePassword } from '../use-cases/auditoria/audit.usecase';
import { datosDeAuditoria } from '../shared/auditoria-request';
import { compararPassword, exigirPasswordValida } from '../shared/password-policy';

export const AuthController = {
  async firstLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'No autorizado' });
      
      const { tempPassword, newPassword, securityQuestions } = req.body;
      
      await firstLoginUseCase(userId, tempPassword, newPassword, securityQuestions);
      await logCambioDePassword(datosDeAuditoria(req), userId, 'primer-inicio');
      res.json({ message: 'Configuración completada exitosamente' });
    } catch (err) {
      next(err);
    }
  },
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { token, user } = await loginUseCase(email, password);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const mustChangePassword = user?.must_change_password === true;
      const mustSetupSecurityQuestions = user?.must_setup_security_questions === true;
      res.json({ token, user, mustChangePassword, mustSetupSecurityQuestions });
    } catch (err) {
      next(err);
    }
  },

  logout(_req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada' });
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.isLocal) {
        return res.json({ user: req.user });
      }
      const user: any = await UserRepository.findById(req.user?.id as string);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      
      res.json({ 
        user: { 
          ...req.user, 
          name: user.name, 
          apellidos: user.apellidos,
          email: user.email 
        } 
      });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!currentPassword || !newPassword)
        return res.status(400).json({ error: 'Contraseña actual y nueva son obligatorias' });
      if (req.user?.isLocal)
        return res.status(403).json({ error: 'El usuario local no puede cambiar contraseña' });

      // La política se comprueba antes de tocar la base. `updateUser` la vuelve a
      // aplicar al hashear —es su responsabilidad, no la de quien la llama—, pero
      // fallar aquí devuelve el error de formato sin haber consultado nada.
      exigirPasswordValida(newPassword);

      const userWithPw = await UserRepository.findByIdWithPassword(userId!);
      if (!userWithPw) return res.status(404).json({ error: 'Usuario no encontrado' });

      const valid = await compararPassword(currentPassword, (userWithPw as any).password_hash || '');
      if (!valid) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

      await updateUser(userId!, { password: newPassword, must_change_password: false });
      await logCambioDePassword(datosDeAuditoria(req), userId!, 'cambio-voluntario');
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      next(err);
    }
  },
};
