import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { loginUseCase } from '../use-cases/auth/login.usecase';
import { firstLoginUseCase } from '../use-cases/auth/first-login.usecase';
import { UserRepository } from '../repositories/usuarios.repository';
import { updateUser } from '../use-cases/usuarios/listar-usuarios.usecase';

export const AuthController = {
  async firstLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'No autorizado' });
      
      const { tempPassword, newPassword, securityQuestions } = req.body;
      
      await firstLoginUseCase(userId, tempPassword, newPassword, securityQuestions);
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
      res.json({ user, mustChangePassword, mustSetupSecurityQuestions });
    } catch (err) {
      next(err);
    }
  },

  logout(_req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada' });
  },

  me(req: Request, res: Response) {
    res.json({ user: req.user });
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!currentPassword || !newPassword)
        return res.status(400).json({ error: 'Contraseña actual y nueva son obligatorias' });
      if (newPassword.length < 8)
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
      if (req.user?.isLocal)
        return res.status(403).json({ error: 'El usuario local no puede cambiar contraseña' });

      const userWithPw = await UserRepository.findByIdWithPassword(userId!);
      if (!userWithPw) return res.status(404).json({ error: 'Usuario no encontrado' });

      const valid = await bcrypt.compare(currentPassword, (userWithPw as any).password_hash || '');
      if (!valid) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

      await updateUser(userId!, { password: newPassword, must_change_password: false });
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      next(err);
    }
  },
};
