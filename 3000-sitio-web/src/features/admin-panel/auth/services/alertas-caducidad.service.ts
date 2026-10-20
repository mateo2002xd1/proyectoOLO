/** Necesario para que el navegador mande la cookie de sesión al proxy de Next. */
const FETCH_OPTS: RequestInit = { credentials: 'include' };

/** El backend acepta 1-30; 30 da margen suficiente para planear renovaciones. */
const VENTANA_DIAS_POR_DEFECTO = 30;

export type AlertaCaducidad = {
  userId: string;
  name: string;
  email: string;
  expiration: string;
  daysLeft: number;
};

export type RespuestaAlertasCaducidad = {
  alerts: AlertaCaducidad[];
  count: number;
};

/**
 * Cuentas activas cuya `expiration_date` cae dentro de la ventana pedida.
 * El filtro y el cálculo de días viven en el backend (`getExpirationAlerts`)
 * para no duplicar la lógica de fechas ni el criterio de "cuenta activa".
 */
export async function listarAlertasCaducidad(
  windowDays = VENTANA_DIAS_POR_DEFECTO,
): Promise<RespuestaAlertasCaducidad> {
  const res = await fetch(`/api/alerts?windowDays=${windowDays}`, FETCH_OPTS);
  if (!res.ok) {
    throw new Error('No se pudieron cargar las alertas de cuentas próximas a vencer.');
  }
  return res.json();
}
