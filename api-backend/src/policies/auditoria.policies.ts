/**
 * Quién puede leer la bitácora de auditoría.
 *
 * La lista es corta a propósito. `auditoria_cambios` guarda, además de quién tocó
 * qué, la **IP y el user-agent** de cada editor: es un registro sobre las personas
 * que trabajan en el sistema, no sobre el contenido. Abrirlo a todo el que tenga
 * sesión convierte una herramienta de control interno en vigilancia lateral entre
 * compañeros.
 *
 * Por eso ni `editor` ni `director` ni `subdirector` entran: HU-07 la pide para el
 * Administrador, y quien edita no necesita ver el rastro de los demás.
 *
 * Se resuelve por rol y no con `requirePermission('auditoria.ver')` porque en
 * `permisos` solo están sembrados `acceso.sitio` y `acceso.intranet`: exigir una
 * clave que no existe dejaría fuera a todo el mundo salvo al superadmin (que tiene
 * bypass) hasta que se corriera una migración. Si algún día la asignación de quién
 * audita debe hacerse desde el panel sin tocar código, entonces sí toca permiso en
 * base de datos — hoy no lo pide nadie.
 *
 * Los nombres se comparan en minúsculas por la misma razón que en
 * `paginas.policies.ts`: en la tabla `roles` están capitalizados ('Administrador'),
 * el JWT los lleva tal cual, y comparar literal dejaría fuera a todo el mundo.
 */
const ROLES_QUE_AUDITAN = ['superadmin', 'administrador'];

const normalizar = (rol: string | undefined | null) => (rol ?? '').trim().toLowerCase();

export const auditoriaPolicies = {
  puedeVer: (user?: any) => ROLES_QUE_AUDITAN.includes(normalizar(user?.role)) || !!user?.permisos?.includes('auditoria.ver'),
};

export type PermisoAuditoria = keyof typeof auditoriaPolicies;
