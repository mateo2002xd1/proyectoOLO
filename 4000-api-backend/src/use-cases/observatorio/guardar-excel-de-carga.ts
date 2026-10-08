import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { UniqueConstraintError } from 'sequelize';
// `file-type` va fijado en `^16.5.4` en este backend (a diferencia del `^22` de
// `sitio-web`) porque desde la v17 el paquete pasó a ser ESM puro y este backend
// compila a CommonJS (`tsconfig.json`: `module: "commonjs"`). La v16 expone
// `fromBuffer`, no `fileTypeFromBuffer`, pero con la misma forma que
// `@olo/upload-policy` espera de un `DetectorDeTipo`.
import { fromBuffer as detectarTipoDeArchivo } from 'file-type';
import { validarArchivoSubido, fueRechazada } from '@olo/upload-policy';
import { ObservatorioRepository as Repo } from '../../repositories/observatorio.repository';
import { redisEstaListo } from '../../infrastructure/redis';
import {
  directorioDeCargas,
  resolverRutaDeCarga,
  rutaRelativaDeCarga,
} from '../../infrastructure/storage/filesystem';

// El Excel de carga no se sirve nunca al público, a diferencia de los adjuntos de las
// páginas: vive en `cargas-datos/` del filesystem, que ninguna ruta de
// `/api/archivos` expone, porque solo lo lee el worker, una vez, para parsearlo.

/** Rechazo de una subida con el código HTTP que debe ver el panel. */
export class ErrorDeSubida extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Vuelve a escribir el Excel si su fila en `archivos` existe pero el archivo no está en
 * este disco.
 *
 * La base de desarrollo (Neon) la comparten varios equipos y el servidor arranca con una
 * copia de sus datos, pero cada máquina tiene su propio filesystem: la fila que
 * dejó una carga hecha en otro equipo apunta a un archivo que aquí no existe. Sin esto,
 * volver a subir ese mismo Excel encontraba la fila por su hash y el worker fallaba al
 * leerlo; por eso se llegaron a versionar en git Excel subidos desde el panel. Los bytes
 * son los mismos —el SHA-256 lo garantiza—, así que basta con escribir los que acaban
 * de llegar.
 */
async function restaurarSiFalta(rutaRelativa: string, datos: Buffer): Promise<void> {
  const rutaAbsoluta = resolverRutaDeCarga(rutaRelativa);
  const existe = await fs.access(rutaAbsoluta).then(() => true, () => false);
  if (existe) return;
  await fs.mkdir(path.dirname(rutaAbsoluta), { recursive: true });
  await fs.writeFile(rutaAbsoluta, datos);
}

/**
 * Lo común a toda carga de "Actualizaciones": valida el archivo (tipo real por magic
 * bytes, solo `.xlsx`, tamaño) y lo guarda en `cargas-datos/` con su fila en
 * `archivos`, deduplicado por SHA-256. Si la carga se va a encolar, antes exige Redis.
 *
 * Lo usan las cuatro cargas; cada una crea después su propia fila en `cargas_datos`.
 *
 * @param requiereCola `false` solo para las cargas que se resuelven en la misma
 * petición, sin worker — hoy "Fuentes futuras de empleo", que no importa nada a una
 * tabla: guarda el Excel y el portal lo lee. Las demás lo dejan en `true`.
 *
 * @throws {ErrorDeSubida} 503 sin Redis, 4xx si el archivo no es un `.xlsx` válido.
 */
export async function validarYGuardarExcel(
  datos: Buffer,
  nombreOriginal: string,
  subidoPor: string | null,
  { requiereCola = true }: { requiereCola?: boolean } = {}
): Promise<{ archivoId: string; rutaAbsoluta: string }> {
  // Lo primero, antes de guardar el archivo o crear la carga. Con Redis caído,
  // `heavyJobsQueue.add()` no falla: se queda esperando para siempre
  // (`maxRetriesPerRequest: null`, que BullMQ exige), así que sin esta comprobación la
  // subida se colgaba y dejaba en el historial una carga en «procesando 0 %» que no
  // avanzaba nunca. Así se rechaza en el acto, sin dejar nada a medias.
  //
  // El mensaje nombra a Redis a propósito, pese a §6: este endpoint solo lo usa un
  // Administrador, y lo que necesita saber es qué hay que levantar, no un «inténtalo
  // más tarde» que no dice qué está fallando.
  if (requiereCola && !redisEstaListo()) {
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
  if (archivo) {
    await restaurarSiFalta(archivo.get('rutaRelativa') as string, datos);
  } else {
    await fs.mkdir(directorioDeCargas(), { recursive: true });
    const rutaRelativa = rutaRelativaDeCarga(resultado.nombreArchivo);
    await fs.writeFile(resolverRutaDeCarga(rutaRelativa), datos);

    try {
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
    } catch (error) {
      // El mismo Excel subido dos veces a la vez: las dos peticiones pasan la búsqueda
      // por hash y la segunda choca con `archivos.hash_sha256 UNIQUE`. Antes eso era un
      // 500 y una copia huérfana en disco; ahora se borra la copia y se usa la fila de
      // la primera.
      if (!(error instanceof UniqueConstraintError)) throw error;
      await fs.unlink(resolverRutaDeCarga(rutaRelativa)).catch(() => undefined);
      archivo = await Repo.buscarArchivoPorHash(hashSha256);
      if (!archivo) throw error;
    }
  }

  return {
    archivoId: archivo.get('id') as string,
    rutaAbsoluta: resolverRutaDeCarga(archivo.get('rutaRelativa') as string),
  };
}
