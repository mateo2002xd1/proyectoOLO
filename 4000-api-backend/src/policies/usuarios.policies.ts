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
 * el panel de usuarios y roles (`/admin/dashboard`) lo abren los dos —lo decide
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
