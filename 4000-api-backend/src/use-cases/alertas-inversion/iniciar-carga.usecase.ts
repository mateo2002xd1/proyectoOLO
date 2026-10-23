import { AlertasInversionRepository as Repo } from '../../repositories/alertas-inversion.repository';
import { getHeavyJobsQueue } from '../../infrastructure/redis/queue';
import { validarYGuardarExcel } from '../observatorio/guardar-excel-de-carga';

export { ErrorDeSubida } from '../observatorio/guardar-excel-de-carga';

/**
 * Valida, guarda y encola el Excel de "Alertas de inversión" — mismo patrón que
 * `observatorio/iniciar-carga.usecase.ts`: `validarYGuardarExcel` es genérico (ya lo
 * reutiliza también la tendencia ocupacional) y deja el Excel deduplicado por hash en
 * `archivos`, sin importar de qué tarjeta de "Actualizaciones" viene.
 */
export async function iniciarCargaAlertasInversion(
  datos: Buffer,
  nombreOriginal: string,
  subidoPor: string | null
): Promise<{ cargaId: string }> {
  const { archivoId, rutaAbsoluta } = await validarYGuardarExcel(datos, nombreOriginal, subidoPor);

  const carga = await Repo.crearCarga(archivoId, subidoPor);
  const cargaId = carga.get('id') as string;

  await getHeavyJobsQueue().add('importar-alertas-inversion-excel', { cargaId, rutaAbsoluta, subidoPor });

  return { cargaId };
}
