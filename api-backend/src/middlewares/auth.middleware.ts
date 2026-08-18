import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { UserRepository } from '../repositories/usuarios.repository';
import jwt from 'jsonwebtoken';
import {
  MINUTOS_DE_INACTIVIDAD_API,
  MINUTOS_ENTRE_REFRESCOS_DE_ACCESO,
} from '../shared/password-policy';

const MS_DE_INACTIVIDAD = MINUTOS_DE_INACTIVIDAD_API * 60 * 1000;
const MS_ENTRE_REFRESCOS = MINUTOS_ENTRE_REFRESCOS_DE_ACCESO * 60 * 1000;

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
     * Inactividad: la sesión se cierra sola si la API lleva demasiado sin verte.
     *
     * Esto es lo que hace real el cierre por inactividad. El temporizador del
     * navegador (`@olo/inactividad`) enseña el aviso y da la buena experiencia, pero
     * quien robe la cookie no ejecuta ese código: sin esta comprobación el token
     * seguiría sirviendo los siete días que dura su firma.
     *
     * `ultimo_acceso_en` ya existía y solo se escribía al iniciar sesión, así que no
     * medía nada. Ahora se refresca aquí —con freno, ver abajo— y es la marca contra
     * la que se compara.
     *
     * La ventana es más ancha que la del navegador a propósito, para que el cliente
     * cierre siempre primero y nadie se encuentre un 401 en mitad de un clic.
     */
    const ultimoAcceso = (user as any).last_access_at;
    if (ultimoAcceso) {
      const inactivoDesdeHace = Date.now() - new Date(ultimoAcceso).getTime();
      if (inactivoDesdeHace > MS_DE_INACTIVIDAD) {
        return res.status(401).json({ error: 'Sesión cerrada por inactividad' });
      }
      // Se refresca como mucho una vez por minuto: cada pantalla del panel hace varias
      // peticiones, y sin el freno esto sería un UPDATE por cada una.
      if (inactivoDesdeHace > MS_ENTRE_REFRESCOS) {
        // Sin await: la petición no depende del resultado y encadenarla añadiría el
        // viaje de ida y vuelta a la base al tiempo de respuesta de *todo* el panel.
        // Si falla, el peor efecto es que la marca se refresque en la siguiente.
        UserRepository.updateLastAccess((user as any).id).catch(() => undefined);
      }
    } else {
      // Cuentas anteriores a esta medida, o creadas sin pasar por el login: se les
      // pone la marca ahora en vez de tratarlas como inactivas y echarlas.
      UserRepository.updateLastAccess((user as any).id).catch(() => undefined);
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
