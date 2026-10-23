import { describirErrorParaLog } from '../../shared/errores';
import fs from 'fs/promises';
import { ObservatorioRepository as Repo } from '../../repositories/observatorio.repository';
import { resolverRutaDeCarga } from '../../infrastructure/storage/filesystem';
import { MODULO_CARGA as MODULO_CARGA_TENDENCIA } from '../../repositories/tendencia-ocupacional.repository';

export class ErrorAlEliminarCarga extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Borra una carga del historial de "Actualizaciones" y, si nadie más comparte
 * el archivo (mismo Excel subido dos veces, o adjunto en un contenido de RF-02),
 * también el Excel físico en `cargas-datos/` del filesystem y su fila en `archivos`.
 *
 * Nunca borra los datos ya importados a `programas_sobresalientes` — esto es
 * solo la auditoría de la carga, no un "deshacer" de lo que ya se publicó.
 *
 * Se puede borrar aunque siga en "procesando": las escrituras de progreso
 * (`actualizarProgreso`/`marcarCargaCompletada`/`marcarCargaError`) son un
 * `UPDATE ... WHERE id` que simplemente no encuentra fila si ya se borró, sin
 * lanzar error — necesario porque una carga real puede quedar así para
 * siempre si el proceso se reinicia (o Redis se cae) a mitad de camino, y sin
 * esto esa fila zombi no se podría borrar jamás.
 */
export async function eliminarCargaObservatorio(id: string): Promise<void> {
  const carga = await Repo.obtenerCarga(id);
  if (!carga) {
    throw new ErrorAlEliminarCarga('Carga no encontrada.', 404);
  }

  // Las de tendencia ocupacional tienen su propia ruta, que además retira del corte los
  // datos de la carga vigente (`eliminarCargaTendencia`). Esta, la de programas, no sabe
  // hacerlo y dejaría un corte con datos sin la carga que los trajo.
  if (carga.get('modulo') === MODULO_CARGA_TENDENCIA) {
    throw new ErrorAlEliminarCarga(
      'Las cargas de tendencia ocupacional se eliminan con DELETE /api/observatorio/tendencia-ocupacional/cargas/:id.',
      409
    );
  }

  const archivoId = carga.get('archivoId') as string | null;
  await Repo.eliminarCarga(id);

  if (archivoId) await eliminarArchivoSiQuedaSuelto(archivoId, id);
}

/**
 * Borra el Excel de `uploads/cargas-datos/` y su fila en `archivos`, salvo que otra carga o
 * un contenido lo siga usando: los archivos se deduplican por contenido, así que el mismo
 * Excel subido dos veces —o a dos periodos de tendencia— es un solo archivo.
 *
 * Se llama con la carga ya borrada. Un archivo que no estaba en disco (o un permiso raro)
 * no tumba la petición: la carga ya no existe y el registro del archivo tampoco.
 *
 * @returns `true` si el archivo se borró; `false` si se conservó porque sigue en uso.
 */
export async function eliminarArchivoSiQuedaSuelto(archivoId: string, cargaId: string): Promise<boolean> {
  const otrasReferencias = await Repo.otrasReferenciasAlArchivo(archivoId, cargaId);
  if (otrasReferencias > 0) return false;

  const archivo = await Repo.obtenerArchivo(archivoId);
  if (!archivo) return true;

  await Repo.eliminarArchivo(archivoId);

  const rutaAbsoluta = resolverRutaDeCarga(archivo.get('rutaRelativa') as string);
  await fs.unlink(rutaAbsoluta).catch((error) => {
    console.error(`[observatorio] No se pudo borrar el archivo físico de la carga ${cargaId}:`, describirErrorParaLog(error));
  });
  return true;
}
