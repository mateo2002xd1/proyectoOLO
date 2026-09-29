import { AlertasInversionRepository as Repo } from '../../repositories/alertas-inversion.repository';

/** Historial de cargas para la tarjeta "Alertas de inversión" de "Actualizaciones". */
export const listarCargasAlertasInversion = () => Repo.listarCargas();

/** Una carga por su id, para que el panel siga su progreso. */
export const obtenerCargaAlertasInversion = (id: string) => Repo.obtenerCarga(id);
