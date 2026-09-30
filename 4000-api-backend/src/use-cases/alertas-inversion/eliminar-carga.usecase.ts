import { AlertasInversionRepository as Repo, MODULO_CARGA } from '../../repositories/alertas-inversion.repository';
import { eliminarArchivoSiQuedaSuelto } from '../observatorio/eliminar-carga.usecase';

export class ErrorAlEliminarCarga extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Borra una carga del historial de "Alertas de inversión" y, si nadie más comparte
 * el archivo, también el Excel físico y su fila en `archivos` — misma lógica que
 * `observatorio/eliminar-carga.usecase.ts` (`eliminarArchivoSiQuedaSuelto` es
 * genérica: cuenta referencias en `cargas_datos` sin filtrar por módulo).
 *
 * Nunca borra los proyectos ya importados a `proyectos_inversion`: esto es solo la
 * auditoría de la carga.
 */
export async function eliminarCargaAlertasInversion(id: string): Promise<void> {
  const carga = await Repo.obtenerCarga(id);
  if (!carga) {
    throw new ErrorAlEliminarCarga('Carga no encontrada.', 404);
  }
  if (carga.get('modulo') !== MODULO_CARGA) {
    throw new ErrorAlEliminarCarga('Carga no encontrada.', 404);
  }

  const archivoId = carga.get('archivoId') as string | null;
  await Repo.eliminarCarga(id);

  if (archivoId) {
    await eliminarArchivoSiQuedaSuelto(archivoId, id);
  }
}
