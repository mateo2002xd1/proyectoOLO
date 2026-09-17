import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
// `file-type` va fijado en `^16.5.4` en este backend (a diferencia del `^22` de
// `sitio-web`) porque desde la v17 el paquete pasó a ser ESM puro y este backend
// compila a CommonJS (`tsconfig.json`: `module: "commonjs"`). La v16 expone
// `fromBuffer`, no `fileTypeFromBuffer`, pero con la misma forma que
// `@olo/upload-policy` espera de un `DetectorDeTipo`.
import { fromBuffer as detectarTipoDeArchivo } from 'file-type';
import { validarArchivoSubido, fueRechazada } from '@olo/upload-policy';
import { ObservatorioRepository as Repo } from '../../repositories/observatorio.repository';
import { redisEstaListo } from '../../infrastructure/redis';
import { heavyJobsQueue } from '../../infrastructure/redis/queue';

/**
 * El Excel de carga no se sirve nunca al público — a diferencia de `archivos` de
 * RF-02, que vive bajo el `uploads/` que exponen los frontends. Vive en su propio
 * directorio del backend porque solo lo lee el worker, una vez, para parsearlo.
 */
const DIRECTORIO_CARGAS = path.join(process.cwd(), 'uploads', 'cargas-datos');

export class ErrorDeSubida extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

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
  // Lo primero, antes de guardar el archivo o crear la carga. Con Redis caído,
  // `heavyJobsQueue.add()` no falla: se queda esperando para siempre
  // (`maxRetriesPerRequest: null`, que BullMQ exige), así que sin esta comprobación la
  // subida se colgaba y dejaba en el historial una carga en «procesando 0 %» que no
  // avanzaba nunca. Así se rechaza en el acto, sin dejar nada a medias.
  //
  // El mensaje nombra a Redis a propósito, pese a §6: este endpoint solo lo usa un
  // Administrador, y lo que necesita saber es qué hay que levantar, no un «inténtalo
  // más tarde» que no dice qué está fallando.
  if (!redisEstaListo()) {
    throw new ErrorDeSubida(
      'Redis no está disponible. La carga no se puede procesar en este momento; inténtalo de nuevo cuando el servicio esté activo.',
      503
    );
  }

  const resultado = await validarArchivoSubido(datos, detectarTipoDeArchivo, () => crypto.randomUUID());

  if (fueRechazada(resultado)) {
    throw new ErrorDeSubida(resultado.error, resultado.status);
  }

  if (resultado.ext !== 'xlsx') {
    throw new ErrorDeSubida('Este módulo solo acepta archivos Excel (.xlsx).', 415);
  }

  const hashSha256 = crypto.createHash('sha256').update(datos).digest('hex');

  let archivo = await Repo.buscarArchivoPorHash(hashSha256);
  if (!archivo) {
    await fs.mkdir(DIRECTORIO_CARGAS, { recursive: true });
    const rutaRelativa = path.join('uploads', 'cargas-datos', resultado.nombreArchivo);
    await fs.writeFile(path.join(process.cwd(), rutaRelativa), datos);

    archivo = await Repo.crearArchivo({
      nombreOriginal,
      nombreAlmacenado: resultado.nombreArchivo,
      rutaRelativa,
      mimeType: resultado.mime,
      extension: resultado.ext,
      tamanoBytes: datos.length,
      hashSha256,
      subidoPor,
    });
  }

  const carga = await Repo.crearCarga(archivo.get('id') as string, subidoPor);
  const cargaId = carga.get('id') as string;

  await heavyJobsQueue.add('importar-observatorio-excel', {
    cargaId,
    rutaAbsoluta: path.join(process.cwd(), archivo.get('rutaRelativa') as string),
  });

  return { cargaId };
}
