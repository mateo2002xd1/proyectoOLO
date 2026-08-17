import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { UserRepository } from '../repositories/usuarios.repository';
import jwt from 'jsonwebtoken';

// Middleware para verificar la autenticación del usuario mediante Token JWT
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  // 'token' la usa la intranet (pasa la cookie de la API sin tocar); 'sitio_token'
  // la emite sitio-web con nombre propio para no compartir sesión con la intranet
  // en el mismo navegador — ver `sitio-web/src/shared/lib/auth-cookies.ts`.
  const tokenFromCookie = req.cookies?.token ?? req.cookies?.sitio_token;
  // Extrae el token priorizando el header Bearer o la cookie segura de sesión
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : tokenFromCookie;

  if (!token) {
    console.log('[Auth] Token missing in headers/cookies');
    return res.status(401).json({ error: 'No autenticado' });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch (err: any) {
    console.log('[Auth] Token verify failed:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  if (decoded.isLocal) {
    req.user = decoded;
    return next();
  }
  // Validación de seguridad de la cuenta: estado activo, bloqueos temporales y expiración
  try {
    const user = await UserRepository.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    if ((user as any).status !== 'active') return res.status(401).json({ error: 'Cuenta inactiva o suspendida' });
    if ((user as any).locked_until && new Date((user as any).locked_until) > new Date())
      return res.status(401).json({ error: 'Cuenta bloqueada temporalmente' });
    if ((user as any).expiration_date && new Date((user as any).expiration_date) < new Date()) {
      await UserRepository.update((user as any).id, { status: 'inactive' });
      return res.status(401).json({ error: 'Cuenta expirada' });
    }

    /**
     * El rol y el `role_id` salen de **la fila**, no del token.
     *
     * El JWT dura 7 días y lleva dentro el rol que tenía el usuario al iniciar
     * sesión. Confiar en ese claim significaba que degradar a alguien —o quitarle
     * el rol entero— no surtía efecto hasta que su token caducara: durante una
     * semana seguía siendo Administrador para toda la API. Todas las policies leen
     * `req.user.role`, así que el arreglo tiene que estar aquí y no en cada una.
     *
     * No cuesta una consulta extra: la fila ya está cargada aquí arriba para
     * comprobar estado, bloqueo y caducidad.
     */
    req.user = {
      ...decoded,
      role: (user as any).role?.name ?? undefined,
      role_id: (user as any).role_id,
    };
  } catch (err) {
    return next(err);
  }

  next();
}

/**
 * Exige uno de varios roles por nombre.
 *
 * La comparación es en minúsculas por la misma razón que en `paginas.policies.ts`:
 * en la tabla `roles` los nombres están capitalizados ('Editor', 'Superadmin') y el
 * JWT los lleva tal cual, así que comparar literal dejaba fuera a todo el mundo sin
 * fallar en ningún sitio.
 *
 * Para las rutas del proyecto se prefieren los middlewares de `permisos.middleware.ts`,
 * que resuelven contra una policy con nombre propio en vez de contra una lista suelta
 * repetida en cada router.
 */
export function requireRole(...roles: string[]) {
  const permitidos = roles.map((rol) => rol.trim().toLowerCase());
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (!permitidos.includes((req.user.role ?? '').trim().toLowerCase()))
      return res.status(403).json({ error: 'Acceso denegado' });
    next();
  };
}
