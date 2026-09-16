/**
 * Quién puede subir y consultar el historial de cargas de "Actualizaciones".
 *
 * Solo Administrador y Superadmin: no hay editor en este flujo (decisión de
 * sesión — se descartó dejar que cualquiera con `contenidos.editar` importara,
 * que es lo que hacía la primera versión de este endpoint).
 */
const ROLES_QUE_ACTUALIZAN_DATOS = ['superadmin', 'administrador'];

const normalizar = (rol: string | undefined | null) => (rol ?? '').trim().toLowerCase();

export const observatorioPolicies = {
  puedeActualizarDatos: (user?: any) => ROLES_QUE_ACTUALIZAN_DATOS.includes(normalizar(user?.role)),
};

export type PermisoObservatorio = keyof typeof observatorioPolicies;
