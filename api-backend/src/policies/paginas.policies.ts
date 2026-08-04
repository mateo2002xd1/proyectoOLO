/**
 * Quién puede hacer qué sobre una página. Vale igual para el sitio y para la
 * intranet: un editor edita en ambas, y quien aprueba es siempre superadmin o
 * administrador.
 *
 * Dirección y subdirección entran a la intranet y ven el contenido, pero no editan.
 *
 * Los nombres se comparan en minúsculas a propósito: en la tabla `roles` están
 * capitalizados ('Editor', 'Superadmin'), el JWT los lleva tal cual y `LOCAL_AUTH_ROLE`
 * también. Comparar literal dejaría fuera a todo el mundo.
 */
const ROLES_QUE_VEN = ['superadmin', 'administrador', 'editor', 'director', 'subdirector'];
const ROLES_QUE_EDITAN = ['superadmin', 'administrador', 'editor'];
const ROLES_QUE_APRUEBAN = ['superadmin', 'administrador'];

const normalizar = (rol: string | undefined | null) => (rol ?? '').trim().toLowerCase();

const tieneRol = (rol: string | undefined | null, permitidos: string[]) =>
  permitidos.includes(normalizar(rol));

export const paginasPolicies = {
  puedeVer: (rol?: string | null) => tieneRol(rol, ROLES_QUE_VEN),

  puedeEditar: (rol?: string | null) => tieneRol(rol, ROLES_QUE_EDITAN),

  puedePublicar: (rol?: string | null) => tieneRol(rol, ROLES_QUE_APRUEBAN),

  puedeRechazar: (rol?: string | null) => tieneRol(rol, ROLES_QUE_APRUEBAN),
};

export type PermisoPagina = keyof typeof paginasPolicies;
