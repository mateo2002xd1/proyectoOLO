/**
 * Quién puede subir Excel, agregar proyectos a mano y consultar el historial de
 * "Alertas de inversión" (tarjeta de "Actualizaciones").
 *
 * Familia de policy propia y no la de `observatorio.policies.ts`: son módulos
 * distintos de "Actualizaciones" (decisión de sesión), aunque hoy compartan los
 * mismos roles — igual que `paginas` y `auditoria` son policies separadas pese a
 * solaparse.
 */
import { tieneRol } from '../shared/autorizacion';

const ROLES_QUE_ACTUALIZAN_DATOS = ['superadmin', 'administrador'];

export const alertasInversionPolicies = {
  /** Subir un Excel o agregar un proyecto de inversión a mano, y ver el historial de cargas. */
  puedeActualizarDatos: (user?: any) => tieneRol(user?.role, ROLES_QUE_ACTUALIZAN_DATOS),
};

export type PermisoAlertasInversion = keyof typeof alertasInversionPolicies;
