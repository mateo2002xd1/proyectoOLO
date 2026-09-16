/**
 * Quién puede hacer qué sobre una página. Vale igual para el sitio y para la
 * intranet: un editor edita en ambas, y quien aprueba es siempre superadmin o
 * administrador.
 *
 * Dirección y subdirección entran a la intranet y ven el contenido, pero no editan.
 * Los dos comparten un único rol en la tabla `roles`, `Director/Subdirector` —antes
 * eran dos filas separadas con los mismos permisos, y se fundieron en una para que
 * el panel de roles no pudiera desincronizarlas.
 *
 * Los nombres se comparan en minúsculas a propósito: en la tabla `roles` están
 * capitalizados ('Editor', 'Superadmin'), el JWT los lleva tal cual y `LOCAL_AUTH_ROLE`
 * también. Comparar literal dejaría fuera a todo el mundo.
 */
import { rolDeActor, permisosDeActor, type ActorDePolicy } from '../shared/autorizacion';

const ROLES_QUE_VEN = ['superadmin', 'administrador', 'editor', 'director/subdirector'];
const ROLES_QUE_EDITAN = ['superadmin', 'administrador', 'editor'];
const ROLES_QUE_APRUEBAN = ['superadmin', 'administrador'];

const normalizar = (rol: string | undefined | null) => (rol ?? '').trim().toLowerCase();

const tieneRol = (rol: string | undefined | null, permitidos: string[]) =>
  permitidos.includes(normalizar(rol));

export const paginasPolicies = {
  puedeVer: (actor?: ActorDePolicy) =>
    tieneRol(rolDeActor(actor), ROLES_QUE_VEN) || !!permisosDeActor(actor)?.includes('acceso.intranet'),

  puedeEditar: (actor?: ActorDePolicy) =>
    tieneRol(rolDeActor(actor), ROLES_QUE_EDITAN) ||
    !!permisosDeActor(actor)?.some((p: string) => p.startsWith('editar.') || p.startsWith('secciones.') || p.startsWith('editor.')),

  puedePublicar: (actor?: ActorDePolicy) => tieneRol(rolDeActor(actor), ROLES_QUE_APRUEBAN),

  puedeRechazar: (actor?: ActorDePolicy) => tieneRol(rolDeActor(actor), ROLES_QUE_APRUEBAN),

  /**
   * Quitarle a otro el candado de edición que tiene abierto.
   *
   * Los mismos que aprueban, y por el mismo motivo: es una decisión sobre el trabajo
   * ajeno. Sale con nombre propio en vez de reutilizar `puedePublicar` desde quien
   * llama porque son dos permisos distintos que hoy coinciden; si mañana se separan,
   * se separan aquí y no en el caso de uso.
   */
  puedeForzarBloqueo: (actor?: ActorDePolicy) => tieneRol(rolDeActor(actor), ROLES_QUE_APRUEBAN),
};

export type PermisoPagina = keyof typeof paginasPolicies;
