import { ObservatorioRepository as Repo } from '../../repositories/observatorio.repository';
import { getHeavyJobsQueue } from '../../infrastructure/redis/queue';
import { validarYGuardarExcel } from './guardar-excel-de-carga';

export { ErrorDeSubida } from './guardar-excel-de-carga';

/**
 * Valida, guarda y encola el Excel subido desde "Actualizaciones" → "Programa +
 * Sobresalientes". Devuelve de inmediato el id de la carga — el procesamiento real
 * corre en `heavy-jobs` (ver `infrastructure/redis/queue.ts`), sin paso de
 * aprobación: el Administrador sube y la carga arranca sola.
 *
 * Redis es obligatorio: sin la cola no hay carga. No se procesa "en local" como
 * respaldo porque un trabajo que solo vive en memoria se pierde si el backend se
 * reinicia a mitad, y sin la cola dos cargas simultáneas no se ponen en fila —cada
 * una vacía y recarga la tabla, así que se pisarían—.
 */
export async function iniciarCargaObservatorio(
  datos: Buffer,
  nombreOriginal: string,
  subidoPor: string | null
): Promise<{ cargaId: string }> {
  const { archivoId, rutaAbsoluta } = await validarYGuardarExcel(datos, nombreOriginal, subidoPor);

  const carga = await Repo.crearCarga(archivoId, subidoPor);
  const cargaId = carga.get('id') as string;

  await getHeavyJobsQueue().add('importar-observatorio-excel', { cargaId, rutaAbsoluta });

  return { cargaId };
}
