/**
 * Quién administra cuentas y quién toca la configuración de seguridad.
 *
 * Estas rutas estuvieron abiertas a cualquier sesión válida: `user.routes.ts` y sus
 * hermanas solo montaban `requireAuth`, así que un `visitante_interno` podía hacer
 * `PATCH /api/users/<cualquiera>` cambiando el `role_id` a Superadmin, o pedir
 * `reset_password` y leer la contraseña temporal en la respuesta. No era un fallo de
 * propiedad de objeto: era que no había ninguna comprobación después del token.
 *
 * `puedeAdministrarSeguridad` incluye a Administrador y no solo a Superadmin porque
 * el panel de usuarios y roles (`/admin/dashboard`) lo abren los dos —lo decide
 * `sitio-web/src/middleware.ts` con `isAdminRole`— y ahí se asignan permisos a roles.
 * Restringirlo a Superadmin dejaría al Administrador con la pantalla pintada y todas
 * las llamadas en 403. Estrecharlo es cambiar esta lista, no los routers.
 *
 * Los nombres se comparan en minúsculas por lo mismo que en `paginas.policies.ts`:
 * en la tabla `roles` están capitalizados y el JWT los lleva tal cual.
 */
const ROLES_QUE_ADMINISTRAN_USUARIOS = ['superadmin', 'administrador'];
const ROLES_QUE_ADMINISTRAN_SEGURIDAD = ['superadmin', 'administrador'];

const normalizar = (rol: string | undefined | null) => (rol ?? '').trim().toLowerCase();

const tieneRol = (rol: string | undefined | null, permitidos: string[]) =>
  permitidos.includes(normalizar(rol));

export const usuariosPolicies = {
  /** Alta, edición, baja y consulta de cuentas ajenas, y las alertas de caducidad. */
  puedeAdministrarUsuarios: (rol?: string | null) => tieneRol(rol, ROLES_QUE_ADMINISTRAN_USUARIOS),

  /** Roles, permisos y su asignación: quien puede esto puede concederse lo demás. */
  puedeAdministrarSeguridad: (rol?: string | null) => tieneRol(rol, ROLES_QUE_ADMINISTRAN_SEGURIDAD),
};

export type PermisoUsuario = keyof typeof usuariosPolicies;
