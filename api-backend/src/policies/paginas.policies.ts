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
  puedeVer: (user?: any) => tieneRol(user?.role, ROLES_QUE_VEN) || !!user?.permisos?.includes('acceso.intranet'),

  puedeEditar: (user?: any) => tieneRol(user?.role, ROLES_QUE_EDITAN) || !!user?.permisos?.some((p: string) => p.startsWith('editar.') || p.startsWith('secciones.') || p.startsWith('editor.')),

  puedePublicar: (user?: any) => tieneRol(user?.role, ROLES_QUE_APRUEBAN),

  puedeRechazar: (user?: any) => tieneRol(user?.role, ROLES_QUE_APRUEBAN),

  /**
   * Quitarle a otro el candado de edición que tiene abierto.
   *
   * Los mismos que aprueban, y por el mismo motivo: es una decisión sobre el trabajo
   * ajeno. Sale con nombre propio en vez de reutilizar `puedePublicar` desde quien
   * llama porque son dos permisos distintos que hoy coinciden; si mañana se separan,
   * se separan aquí y no en el caso de uso.
   */
  puedeForzarBloqueo: (user?: any) => tieneRol(user?.role, ROLES_QUE_APRUEBAN),
};

export type PermisoPagina = keyof typeof paginasPolicies;
