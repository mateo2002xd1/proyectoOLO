/**
 * Quién puede subir y consultar el historial de cargas de "Actualizaciones".
 *
 * Solo Administrador y Superadmin: no hay editor en este flujo (decisión de
 * sesión — se descartó dejar que cualquiera con `contenidos.editar` importara,
 * que es lo que hacía la primera versión de este endpoint).
 */
const ROLES_QUE_ACTUALIZAN_DATOS = ['superadmin', 'administrador'];

const normalizar = (rol: string | undefined | null) => (rol ?? '').trim().toLowerCase();

/**
 * Quién decide que un corte de datos ya cargado se vea en el sitio público (hoy, la
 * tendencia ocupacional). Es un permiso aparte de cargar aunque hoy lo tengan los mismos
 * roles: publicar es lo que cambia lo que ve el ciudadano, y separarlo permite más
 * adelante que alguien cargue y otro revise y publique sin tocar las rutas.
 */
const ROLES_QUE_PUBLICAN_DATOS = ['superadmin', 'administrador'];

export const observatorioPolicies = {
  puedeActualizarDatos: (user?: any) => ROLES_QUE_ACTUALIZAN_DATOS.includes(normalizar(user?.role)),
  puedePublicarDatos: (user?: any) => ROLES_QUE_PUBLICAN_DATOS.includes(normalizar(user?.role)),
};

export type PermisoObservatorio = keyof typeof observatorioPolicies;
