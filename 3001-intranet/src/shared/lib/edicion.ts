/**
 * Quién edita páginas en la intranet, como reglas puras: sin cookies ni llamadas.
 *
 * Las usan `puedeEditarPaginas` (`sesion.ts`, en el servidor, para pintar los botones de
 * edición) y el login (en el navegador, para el texto del cargador: «Cargando modo
 * edición...»). Antes la regla vivía solo en `sesion.ts`, que importa `next/headers` y no
 * se puede usar en un componente de cliente.
 *
 * Decide qué se pinta, no qué se permite: la API comprueba el rol en cada petición.
 */

/** Roles con permiso de edición. Debe coincidir con `paginasPolicies` en la API. */
const ROLES_QUE_EDITAN = ['superadmin', 'administrador', 'editor'];

/** Si el rol, por sí solo, edita. Dirección y subdirección entran a la intranet pero no editan. */
export function rolEdita(rol: string | null | undefined): boolean {
  return ROLES_QUE_EDITAN.includes((rol ?? '').trim().toLowerCase());
}

/** Si alguno de los permisos deja editar páginas o crear secciones de la intranet. */
export function permisosEditan(permisos: readonly string[]): boolean {
  return permisos.some((p) => p.startsWith('editar.intranet.') || p === 'secciones.crear');
}
