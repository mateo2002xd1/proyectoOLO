import { ObservatorioRepository as Repo } from '../../repositories/observatorio.repository';

/** Historial de cargas para la tarjeta "Programa + Sobresalientes" de "Actualizaciones". */
export const listarCargasObservatorio = () => Repo.listarCargas();

export const obtenerCargaObservatorio = (id: string) => Repo.obtenerCarga(id);
