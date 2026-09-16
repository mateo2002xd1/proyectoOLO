import fs from 'fs/promises';
import path from 'path';
import { ObservatorioRepository as Repo } from '../../repositories/observatorio.repository';

export class ErrorAlEliminarCarga extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Borra una carga del historial de "Actualizaciones" y, si nadie más comparte
 * el archivo (mismo Excel subido dos veces, o adjunto en un contenido de RF-02),
 * también el Excel físico en `uploads/cargas-datos/` y su fila en `archivos`.
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

  const archivoId = carga.get('archivoId') as string | null;
  await Repo.eliminarCarga(id);

  if (!archivoId) return;

  const otrasReferencias = await Repo.otrasReferenciasAlArchivo(archivoId, id);
  if (otrasReferencias > 0) return;

  const archivo = await Repo.obtenerArchivo(archivoId);
  if (!archivo) return;

  await Repo.eliminarArchivo(archivoId);

  const rutaAbsoluta = path.join(process.cwd(), archivo.get('rutaRelativa') as string);
  await fs.unlink(rutaAbsoluta).catch((error) => {
    // El registro ya se borró — un archivo que ya no estaba en disco (o un permiso
    // raro) no debe dejar la carga a medio borrar ni tumbar la petición.
    console.error(`[observatorio] No se pudo borrar el archivo físico de la carga ${id}:`, error);
  });
}
