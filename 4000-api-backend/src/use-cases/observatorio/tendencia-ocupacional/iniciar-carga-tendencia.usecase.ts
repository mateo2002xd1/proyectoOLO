import { TendenciaOcupacionalRepository as Repo } from '../../../repositories/tendencia-ocupacional.repository';
import { heavyJobsQueue } from '../../../infrastructure/redis/queue';
import { ErrorDeSubida, validarYGuardarExcel } from '../guardar-excel-de-carga';
import { mensajeCeldaOcupada } from './reporte-carga';

export interface CeldaSolicitada {
  anio: number;
  /** Código del periodo: T1..T4, S1, S2 o ANUAL. */
  periodo: string;
}

/**
 * Recibe un Excel de percentiles para una celda (año, periodo), lo guarda y lo encola en
 * `heavy-jobs`, igual que la carga de "Programa + Sobresalientes". Un archivo por
 * petición: la carga masiva del panel llama a este mismo endpoint una vez por archivo.
 *
 * El Excel no trae año ni periodo; los elige el administrador. Solo se carga en una celda
 * **libre**: si ya tiene datos (en borrador o publicados) o una carga en curso, se
 * rechaza. Para cambiar el archivo de una celda se elimina antes su carga desde el
 * historial (`eliminarCargaTendencia`).
 *
 * @throws {ErrorDeSubida} 400 si el periodo no existe, 409 si la celda ya tiene datos o una carga
 *   en curso, y los de `validarYGuardarExcel`.
 */
export async function iniciarCargaTendencia(
  datos: Buffer,
  nombreOriginal: string,
  subidoPor: string | null,
  celda: CeldaSolicitada
): Promise<{ cargaId: string }> {
  // El año es libre (cualquiera de cuatro cifras, que ya exige `cargaTendenciaSchema`):
  // años anteriores a la serie y proyecciones hacia adelante.
  const periodo = await Repo.obtenerPeriodo(celda.periodo);
  if (!periodo) throw new ErrorDeSubida(`Periodo desconocido: «${celda.periodo}».`, 400);

  // Antes de guardar nada, para responder 409 en el acto y no dejar un Excel huérfano. El
  // worker lo vuelve a mirar con el candado de la celda: dos subidas a la misma celda
  // vacía pueden pasar las dos por aquí antes de que la primera guarde.
  const corte = await Repo.obtenerCorteDeCelda(celda.anio, periodo.id);
  if (corte) throw new ErrorDeSubida(mensajeCeldaOcupada(celda.anio, periodo.nombre, corte.estado), 409);
  if (await Repo.hayCargaEnCurso(celda.anio, periodo.id)) {
    throw new ErrorDeSubida(
      `${celda.anio} · ${periodo.nombre} ya tiene una carga en curso. Espere a que termine; si quedó ` +
        'detenida, elimínela desde el historial.',
      409
    );
  }

  const { archivoId, rutaAbsoluta } = await validarYGuardarExcel(datos, nombreOriginal, subidoPor);

  const cargaId = await Repo.crearCarga({ archivoId, subidoPor, anio: celda.anio, periodoId: periodo.id });

  await heavyJobsQueue.add('importar-tendencia-ocupacional', { cargaId, rutaAbsoluta });

  return { cargaId };
}
