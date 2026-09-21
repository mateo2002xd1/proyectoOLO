import { Request, Response, NextFunction } from 'express';
import { loginUseCase } from '../use-cases/auth/login.usecase';
import { firstLoginUseCase, estadoPrimerIngreso } from '../use-cases/auth/first-login.usecase';
import { UserRepository } from '../repositories/usuarios.repository';
import { updateUser } from '../use-cases/usuarios/listar-usuarios.usecase';
import { logCambioDePassword } from '../use-cases/auditoria/audit.usecase';
import { datosDeAuditoria, origenDeLaPeticion } from '../shared/auditoria-request';
import { compararPassword, exigirPasswordValida } from '../shared/password-policy';
import { RolePermissionRepository } from '../repositories/role-permissions.repository';
import { CLAVES_DEL_CATALOGO } from '../shared/catalogo-permisos';

export const AuthController = {
  /**
   * Qué le falta a la cuenta para estar operativa.
   *
   * El formulario lo consulta antes de pintarse para no pedir lo que ya está hecho:
   * si un administrador restableció solo las preguntas, no hay contraseña temporal
   * que pedir ni motivo para cambiar la contraseña otra vez.
   */
  async firstLoginStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'No autorizado' });

      // La cuenta maestra no vive en la base y nunca tiene nada pendiente.
      if (req.user?.isLocal) {
        return res.json({ debeCambiarPassword: false, debeConfigurarPreguntas: false });
      }

      res.json(await estadoPrimerIngreso(userId));
    } catch (err) {
      next(err);
    }
  },

  async firstLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'No autorizado' });
      
      const { tempPassword, newPassword, securityQuestions } = req.body;

      const resultado = await firstLoginUseCase(userId, tempPassword, newPassword, securityQuestions);

      // Solo se audita si de verdad hubo cambio de contraseña. Configurar únicamente
      // las preguntas no lo es, y registrarlo como tal ensuciaría la bitácora que la
      // Ley 1581 obliga a poder consultar.
      if (resultado.cambioPassword) {
        await logCambioDePassword(datosDeAuditoria(req), userId, 'primer-inicio');
      }

      res.json({ message: 'Configuración completada exitosamente', ...resultado });
    } catch (err) {
      next(err);
    }
  },
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      // Registra «Autenticación» (o «Expiró», si la cuenta acaba de caducar) — ver
      // `login.usecase.ts`. sitio-web e intranet llegan aquí igual: el ámbito no
      // distingue el login, así que un solo punto cubre las dos.
      const { token, user } = await loginUseCase(email, password, origenDeLaPeticion(req));

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

  /**
   * Quién es quien pregunta, y **qué puede hacer**.
   *
   * `permisos` se añadió porque los frontends no tenían forma honesta de decidir qué
   * pintar: el token lleva el rol, no las claves, así que un botón como «Nueva
   * sección» —que exige `secciones.crear`— solo se podía enseñar adivinando por rol.
   * Adivinar de menos esconde acciones a quien sí puede; adivinar de más pinta
   * botones que responden 403. Ahora se pregunta.
   *
   * Superadmin recibe el catálogo entero: su bypass vive en `resolverPermisos` y no
   * en la tabla, así que sin esto el panel le enseñaría menos de lo que puede hacer.
   *
   * Devuelve **los permisos de quien llama**, nunca los de otro: la ruta va detrás de
   * `requireAuth` y la clave se resuelve desde `req.user`.
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const rol = req.user?.role ?? '';
      const permisos =
        rol.trim().toLowerCase() === 'superadmin'
          ? CLAVES_DEL_CATALOGO
          : await RolePermissionRepository.getPermissionsByRole(rol);

      if (req.user?.isLocal) {
        return res.json({ user: req.user, permisos });
      }
      const user: any = await UserRepository.findById(req.user?.id as string);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      res.json({
        user: {
          ...req.user,
          name: user.name,
          apellidos: user.apellidos,
          email: user.email
        },
        permisos
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

      // Sin actor a propósito: este camino no es «editar una cuenta», es el cambio de
      // contraseña de la propia sesión, y ya demostró quién es comparando la
      // contraseña actual doce líneas más arriba. Pasar el actor lo haría chocar
      // contra la lista blanca de autoservicio, que no admite `password`.
      await updateUser(userId!, { password: newPassword, must_change_password: false });
      await logCambioDePassword(datosDeAuditoria(req), userId!, 'cambio-voluntario');
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      next(err);
    }
  },
};
