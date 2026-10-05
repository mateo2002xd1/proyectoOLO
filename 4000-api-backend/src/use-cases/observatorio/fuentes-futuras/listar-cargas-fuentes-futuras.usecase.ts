import { FuentesFuturasEmpleoRepository as Repo } from '../../../repositories/fuentes-futuras-empleo.repository';

/** Historial de cargas para la tarjeta "Fuentes futuras de empleo" de "Actualizaciones". */
export const listarCargasFuentesFuturas = () => Repo.listarCargas();
