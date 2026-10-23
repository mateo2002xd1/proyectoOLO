import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { UserRepository } from '../repositories/usuarios.repository';
import { permisosDeRol } from '../shared/permisos-de-rol';
import jwt from 'jsonwebtoken';
import {
  MINUTOS_DE_INACTIVIDAD_API,
  MINUTOS_ENTRE_REFRESCOS_DE_ACCESO,
  MENSAJE_TEMPORAL_VENCIDA,
  temporalVencida,
} from '../shared/password-policy';

const MS_DE_INACTIVIDAD = MINUTOS_DE_INACTIVIDAD_API * 60 * 1000;
const MS_ENTRE_REFRESCOS = MINUTOS_ENTRE_REFRESCOS_DE_ACCESO * 60 * 1000;

/** Lo que responde la API a una cuenta que aún no terminó su primer ingreso. */
export const CODIGO_CONFIGURACION_PENDIENTE = 'CONFIGURACION_PENDIENTE';

/**
 * Exige una sesión válida: verifica el JWT, comprueba en la base que la cuenta siga
 * activa, sin bloqueo, sin caducar y sin inactividad, y deja en `req.user` los datos
 * de la fila (no los del token). Responde 401 en cualquier otro caso.
 *
 * **Y que la cuenta esté configurada.** Una sesión abierta con la contraseña temporal,
 * o sin preguntas de seguridad, solo sirve para terminar esa configuración: para todo
 * lo demás responde 403 con `codigo: CONFIGURACION_PENDIENTE`. Hasta el 2026-10-09 solo
 * lo hacían cumplir los proxies de las dos apps, redirigiendo pantallas; la API
 * aceptaba la sesión entera, así que quien salía de `/login/first-login` sin terminar
 * («Regresar al sitio web») seguía en el portal con sus botones de edición y con todo
 * su rol detrás. Las rutas del propio primer ingreso usan
 * `requireAuthConConfiguracionPendiente`.
 *
 * Se mira **la fila**, no el token: el token se firma al entrar y dice «pendiente»
 * hasta que caduca, aunque la configuración ya se haya completado.
 *
 * Para las rutas del proyecto, lo que viene después de la sesión —qué puede hacer cada
 * rol— lo deciden los middlewares de `permisos.middleware.ts` contra una policy.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  return autenticar(req, res, next, false);
}

/**
 * `requireAuth` que deja pasar una cuenta a medio configurar.
 *
 * Solo para lo que hace falta para terminar el primer ingreso: saber qué falta, quién
 * es (`/me`), cambiar la contraseña y guardar las preguntas. Cualquier otra ruta va
 * con `requireAuth`.
 */
export function requireAuthConConfiguracionPendiente(req: Request, res: Response, next: NextFunction) {
  return autenticar(req, res, next, true);
}

/**
 * La cookie de sesión de la app que hace la petición.
 *
 * `token` la usa la intranet (pasa la cookie de la API sin tocar); `sitio_token` la
 * emite el sitio web con nombre propio para no compartir sesión con la intranet en el
 * mismo navegador — ver `3000-sitio-web/src/shared/lib/session/auth-cookies.ts`.
 *
 * Pero las cookies no se separan por puerto: en `localhost` el navegador manda las dos
 * a la API, sea cual sea la app que pide. Antes se leía `token ?? sitio_token`, así que
 * con una sesión abierta en la intranet, las llamadas directas del sitio web (los
 * clientes axios con `withCredentials`, como Respaldos) se hacían **con la cuenta de la
 * intranet**. Visto el 2026-10-15: el panel del sitio con una cuenta ya configurada
 * recibía «Termina de configurar tu cuenta…», que era de la cuenta recién creada
 * abierta en la intranet.
 *
 * Por eso se mira el `Origin`, que el navegador pone en toda petición entre orígenes y
 * que CORS ya obliga a que sea uno de estos dos: cada app usa solo su cookie. Sin
 * `Origin` de una de las dos (llamadas de servidor, que van con Bearer, o herramientas)
 * se mantiene el orden de antes.
 *
 * Exportada para `npm run sesion:verificar`, que comprueba estos casos y falla si
 * alguien vuelve a leer las dos cookies sin mirar de dónde viene la petición.
 */
export function tokenDeLaCookie(req: Request): string | undefined {
  const cookies = req.cookies ?? {};
  const origen = req.headers.origin;
  if (origen === config.frontendUrl) return cookies.sitio_token;
  if (origen === config.intranetUrl) return cookies.token;
  return cookies.token ?? cookies.sitio_token;
}

async function autenticar(req: Request, res: Response, next: NextFunction, admitePendiente: boolean) {
  const authHeader = req.headers.authorization;
  const tokenFromCookie = tokenDeLaCookie(req);
  // Extrae el token priorizando el header Bearer o la cookie segura de sesión
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : tokenFromCookie;

  if (!token) {
    console.log('[Auth] Token missing in headers/cookies');
    return res.status(401).json({ error: 'No autenticado' });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, config.jwtSecret, { algorithms: [config.jwtAlgoritmo] });
  } catch (err: any) {
    console.log('[Auth] Token verify failed:', err.name); // REGLA 95.3 BE: Solo imprimir el nombre del error, no el mensaje completo
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
     * seguiría sirviendo las ocho horas que dura su firma.
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
     * El JWT dura 8 horas (antes 7 días) y lleva dentro el rol que tenía el usuario al iniciar
     * sesión. Confiar en ese claim significaba que degradar a alguien —o quitarle
     * el rol entero— no surtía efecto hasta que su token caducara: durante toda
     * la vida del token seguía siendo Administrador para toda la API. Todas las policies leen
     * `req.user.role`, así que el arreglo tiene que estar aquí y no en cada una.
     *
     * No cuesta una consulta extra: la fila ya está cargada aquí arriba para
     * comprobar estado, bloqueo y caducidad.
     */
    req.user = {
      ...decoded,
      name: (user as any).name ?? decoded.name,
      apellidos: (user as any).apellidos ?? decoded.apellidos,
      email: (user as any).email ?? decoded.email,
      role: (user as any).role?.name ?? undefined,
      role_id: (user as any).role_id,
      // De la fila, como el rol: los del token se quedan en «pendiente» hasta que
      // caduca aunque la configuración ya esté hecha.
      must_change_password: Boolean((user as any).must_change_password),
      must_setup_security_questions: Boolean((user as any).must_setup_security_questions),
      // Las claves también salen de la base (con la caché corta y la invalidación de
      // `permisos-de-rol.ts`), no del token: las policies leen `req.user.permisos`, y con las del
      // token revocar un permiso no surtía efecto hasta que caducaba la sesión, 8 horas (SES-02).
      // Y el token ya no las lleva todas (ver `permisosParaElToken`).
      permisos: await permisosDeRol((user as any).role?.name),
    };

    // Una sesión abierta con la temporal no sobrevive a su vencimiento: sin esto, quien
    // entró a las 71 horas podía seguir días con ella (el token dura 7).
    if (temporalVencida(user as any)) {
      return res.status(401).json({ error: MENSAJE_TEMPORAL_VENCIDA });
    }

    if (!admitePendiente && tieneConfiguracionPendiente(req.user)) {
      return res.status(403).json({
        error: 'Termina de configurar tu cuenta (contraseña y preguntas de seguridad) para continuar.',
        codigo: CODIGO_CONFIGURACION_PENDIENTE,
      });
    }
  } catch (err) {
    return next(err);
  }

  next();
}

/**
 * Si a la sesión le queda algo del primer ingreso: la contraseña temporal o las
 * preguntas de seguridad. La cuenta maestra de `.env` nunca (no tiene fila).
 */
export function tieneConfiguracionPendiente(usuario: Request['user']): boolean {
  if (!usuario || usuario.isLocal) return false;
  return Boolean(usuario.must_change_password) || Boolean(usuario.must_setup_security_questions);
}
