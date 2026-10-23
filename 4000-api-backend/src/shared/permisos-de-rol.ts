import { RolePermissionRepository } from '../repositories/role-permissions.repository';
import { normalizarRol, tieneRol } from './autorizacion';
import { CLAVES_DEL_CATALOGO } from './catalogo-permisos';

/**
 * Las claves de permiso de un rol: de dónde salen, cuánto duran en memoria y qué parte viaja en
 * el token de sesión.
 *
 * Antes esto vivía repartido: `require-permission.middleware.ts` tenía la caché, `login.usecase.ts`
 * tenía otra lectura de la misma tabla sin caché, y el token copiaba **todas** las claves del rol
 * (SES-01, SES-02 en `3-seguridad-del-proyecto.md`). Es un solo sitio ahora: quien necesite saber
 * qué puede hacer un rol pregunta aquí, y quien cambie `roles_permisos` invalida aquí.
 */

const cache = new Map<string, { perms: string[]; expires: number }>();

/**
 * TTL corto, y solo como red.
 *
 * El mecanismo principal para que un cambio de permisos surta efecto **de inmediato** es
 * `invalidarPermisosDeRol`, que se llama al escribir. Este vencimiento existe para el
 * caso de varias instancias de la API: una caché en memoria no se entera de lo que
 * escribió otro proceso, así que sin él la otra instancia podría quedarse con permisos
 * viejos indefinidamente. Con N instancias, el peor caso es por tanto este TTL, no «hasta
 * que caduque el token» como antes (8 horas).
 *
 * Antes eran cinco minutos. Para un control de acceso es demasiado: revocar un permiso y
 * que la persona siguiera usándolo un rato no se puede explicar ni en el panel.
 */
const TTL_MS = 30 * 1000;

/**
 * Olvida los permisos cacheados de un rol, o de todos si no se indica ninguno.
 *
 * La llaman los dos únicos caminos que tocan `roles_permisos` —asignar y revocar— y las
 * operaciones sobre roles que dejan la clave huérfana (renombrar, borrar), además de crear o
 * eliminar una sección, que conceden o retiran su clave. Es lo que hace que el cambio se note
 * en la petición siguiente y no al cabo de un rato.
 */
export function invalidarPermisosDeRol(rol?: string | null): void {
  if (rol == null) {
    cache.clear();
    return;
  }
  cache.delete(rol);
  // El nombre del rol viaja en el JWT tal cual está en la tabla, pero un renombrado
  // podría dejar variantes; limpiar por comparación laxa evita dejar una entrada viva
  // con otro uso de mayúsculas.
  const normalizado = normalizarRol(rol);
  for (const clave of cache.keys()) {
    if (normalizarRol(clave) === normalizado) cache.delete(clave);
  }
}

/** Las claves de un rol, de la caché o de la base. */
const clavesDeLaBase = async (rol: string): Promise<string[]> => {
  const entrada = cache.get(rol);
  if (entrada && entrada.expires >= Date.now()) return entrada.perms;

  const perms = await RolePermissionRepository.getPermissionsByRole(rol);
  cache.set(rol, { perms, expires: Date.now() + TTL_MS });
  return perms;
};

/**
 * Las claves de permiso de un rol, tal como las recibe el frontend y las leen las policies.
 *
 * Superadmin recibe el catálogo entero: su bypass vive en `resolverPermisos` y no en la
 * tabla `roles_permisos`, así que sin esto el panel le enseñaría menos de lo que puede
 * hacer. Lo usan el login, `GET /api/me`, `requireAuth` (para `req.user.permisos`) y los
 * guardas de `require-permission.middleware.ts`.
 */
export const permisosDeRol = async (rol: string | null | undefined): Promise<string[]> =>
  tieneRol(rol, ['superadmin']) ? CLAVES_DEL_CATALOGO : clavesDeLaBase(rol ?? '');

const CLAVES_FIJAS = new Set(CLAVES_DEL_CATALOGO);

/**
 * Las claves que van **dentro del token**: solo las del catálogo fijo (`CLAVES_DEL_CATALOGO`,
 * 21 hoy, ~500 bytes).
 *
 * El resto —las `editar.<ámbito>.<slug>` de las secciones creadas desde el editor— crece con
 * los datos, y un token que crece con los datos acaba por no caber: la cookie de sesión pasa
 * el límite de 4 KB y el navegador la **descarta en silencio**, y la cabecera `Authorization`
 * pasa el de Node y responde 431. Esas claves siguen estando completas en la respuesta del
 * login y en `GET /api/me`, y la API las lee de la base en cada petición (`requireAuth`); lo
 * único que no las necesita son los bordes de Next, que solo miran `acceso.*` y `edita`.
 */
export const permisosParaElToken = (permisos: readonly string[]): string[] =>
  permisos.filter((clave) => CLAVES_FIJAS.has(clave));

/**
 * Si alguna de las claves deja editar páginas o crear secciones: las `editar.*`, `secciones.*` y
 * `editor.*`. Es la regla de `paginasPolicies.puedeEditar`, y viaja en el token como `edita`
 * para que el borde del sitio decida sobre `/edit` sin tener todas las claves.
 */
export const tienePermisoDeEdicion = (permisos: readonly string[]): boolean =>
  permisos.some((clave) => clave.startsWith('editar.') || clave.startsWith('secciones.') || clave.startsWith('editor.'));
