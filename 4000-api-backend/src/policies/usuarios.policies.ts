/**
 * Quién administra cuentas y quién toca la configuración de seguridad.
 *
 * Estas rutas estuvieron abiertas a cualquier sesión válida: `user.routes.ts` y sus
 * hermanas solo montaban `requireAuth`, así que un `Director/Subdirector` —de solo
 * lectura— podía hacer `PATCH /api/users/<cualquiera>` cambiando el `role_id` a
 * Superadmin, o pedir
 * `reset_password` y leer la contraseña temporal en la respuesta. No era un fallo de
 * propiedad de objeto: era que no había ninguna comprobación después del token.
 *
 * `puedeAdministrarSeguridad` incluye a Administrador y no solo a Superadmin porque
 * el panel de usuarios y roles (`/admin-panel/dashboard`) lo abren los dos —lo decide
 * `3000-sitio-web/src/proxy.ts` con el permiso `acceso.panel`— y ahí se asignan permisos a roles.
 * Restringirlo a Superadmin dejaría al Administrador con la pantalla pintada y todas
 * las llamadas en 403. Estrecharlo es cambiar esta lista, no los routers.
 *
 * Los nombres se comparan en minúsculas por lo mismo que en `paginas.policies.ts`:
 * en la tabla `roles` están capitalizados y el JWT los lleva tal cual.
 */
import { rolDeActor, permisosDeActor, tieneRol, type ActorDePolicy } from '../shared/autorizacion';

const ROLES_QUE_ADMINISTRAN_USUARIOS = ['superadmin', 'administrador'];
const ROLES_QUE_ADMINISTRAN_SEGURIDAD = ['superadmin', 'administrador'];

export const usuariosPolicies = {
  /** Alta, edición, baja y consulta de cuentas ajenas, y las alertas de caducidad. */
  puedeAdministrarUsuarios: (actor?: ActorDePolicy) =>
    tieneRol(rolDeActor(actor), ROLES_QUE_ADMINISTRAN_USUARIOS) ||
    !!permisosDeActor(actor)?.some((p: string) => p.startsWith('usuarios.')),

  /** Roles, permisos y su asignación: quien puede esto puede concederse lo demás. */
  puedeAdministrarSeguridad: (actor?: ActorDePolicy) =>
    tieneRol(rolDeActor(actor), ROLES_QUE_ADMINISTRAN_SEGURIDAD) ||
    !!permisosDeActor(actor)?.includes('usuarios.permisos'),
};

export type PermisoUsuario = keyof typeof usuariosPolicies;

/** Roles cuyas cuentas solo gestiona alguien de su mismo nivel. */
const ROLES_RESERVADOS_AL_SUPERADMIN = ['superadmin'];

/**
 * ¿Puede este actor crear, editar, desactivar, borrar o asignar la cuenta de un rol dado?
 *
 * `puedeAdministrarUsuarios` dice *si* alguien gestiona cuentas, no *cuáles*: un
 * Administrador pasaba por ella sobre una cuenta Superadmin y podía restablecerle la
 * contraseña (la temporal venía en la respuesta), cambiarle el correo, degradarla,
 * desactivarla, borrarla, o crear y ascender cuentas a Superadmin. Eso es una escalada
 * vertical: un rol que no es el máximo se hacía con el máximo. Aquí se fija que el rol de
 * Superadmin solo lo gestiona un Superadmin.
 *
 * Va aparte de `usuariosPolicies` porque necesita el rol del objeto además del actor, y
 * esa forma (`actor`) no encaja con las guardias de ruta. No decide nada entre
 * Administradores: eso se gestiona hoy entre ellos, y cambiarlo es otra decisión.
 */
export const puedeGestionarCuentaDeRol = (actor: ActorDePolicy, rolDelObjeto: string | null | undefined): boolean =>
  !tieneRol(rolDelObjeto, ROLES_RESERVADOS_AL_SUPERADMIN) ||
  tieneRol(rolDeActor(actor), ROLES_RESERVADOS_AL_SUPERADMIN);

/** El 403 de {@link puedeGestionarCuentaDeRol}, con el mismo texto en todos los caminos. */
export const errorCuentaReservada = () =>
  Object.assign(new Error('Solo un Superadmin puede gestionar cuentas de Superadmin'), { status: 403 });
