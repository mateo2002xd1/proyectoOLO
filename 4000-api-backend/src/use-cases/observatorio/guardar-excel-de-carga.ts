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
import { validarArchivoSubido, fueRechazada, leerDirectorioCentralDeZip, normalizarNombreOriginal } from '@olo/upload-policy';
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

/**
 * Tope de cuánto puede pesar un .xlsx ya descomprimido (SUB-01). El tamaño comprimido de
 * entrada ya está acotado en 50 MB por `@olo/upload-policy`; esto es lo que se permite que
 * esos 50 MB se conviertan en memoria.
 */
const LIMITE_DESCOMPRIMIDO_BYTES = 400 * 1024 * 1024;

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
  nombreOriginalCrudo: string,
  subidoPor: string | null,
  { requiereCola = true }: { requiereCola?: boolean } = {}
): Promise<{ archivoId: string; rutaAbsoluta: string; nombreOriginal: string }> {
  // SUB-05: normalizado antes de que se use para nada (el mensaje de la carga, la fila de
  // `archivos`), no solo al guardar — sin controles, sin marcas de dirección de texto,
  // con un tope de longitud. Nunca se usó para el nombre en disco (ese es UUID, ver
  // `validarArchivoSubido`); esto es solo lo que se le muestra a quien mira el historial.
  const nombreOriginal = normalizarNombreOriginal(nombreOriginalCrudo);

  // Lo primero, antes de guardar el archivo o crear la carga. Con Redis caído,
  // `getHeavyJobsQueue().add()` no falla: se queda esperando para siempre
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

  // SUB-01: hasta aquí solo se había comprobado el tamaño COMPRIMIDO (50 MB, en
  // `validarArchivoSubido`). Un .xlsx es un ZIP, y nada impedía que esos 50 MB
  // descomprimieran a varios GB antes de que `exceljs.load()` —en el worker, que
  // corre en el mismo proceso que la API (`server.ts: setupWorker()`)— reservara esa
  // memoria entera de golpe. Los topes de filas de cada módulo (`MAX_FILAS`) no
  // protegían de esto: se comprueban DESPUÉS de cargar el libro completo.
  //
  // Este tope lee el directorio central del ZIP —nombres y tamaños declarados, sin
  // descomprimir nada— y suma cuánto pesaría el archivo entero una vez abierto.
  // Único punto de entrada de las 4 cargas de "Actualizaciones": un solo lugar que
  // tocar y que probar. 400 MB es generoso frente a los 50 MB de entrada (un .xlsx
  // tabular normal rara vez pasa de 10:1); un zip bomb de cientos de GB no.
  //
  // Lo que esto NO cierra por sí solo (abierto como SUB-01 en 3-seguridad §4.10, con
  // el resto del arreglo pendiente de decisión): el campo que se lee es el que
  // declara el propio ZIP, no una medición real, así que sigue haciendo falta un
  // límite duro de memoria en el contenedor como segunda defensa; y el proceso de la
  // API sigue siendo el mismo que el del worker.
  const entradasDelZip = leerDirectorioCentralDeZip(datos);
  if (entradasDelZip) {
    const descomprimido = entradasDelZip.reduce((total, e) => total + e.tamanoDescomprimido, 0);
    if (descomprimido > LIMITE_DESCOMPRIMIDO_BYTES) {
      throw new ErrorDeSubida(
        `El archivo descomprime a más de ${LIMITE_DESCOMPRIMIDO_BYTES / (1024 * 1024)} MB. ` +
          'Revisa que no tenga hojas u objetos de más.',
        413
      );
    }
  }
  // `entradasDelZip === null` (ZIP sin directorio central legible): se deja pasar. Es el
  // mismo criterio que `traeProyectoDeMacros` — negarse a aceptar cualquier `.xlsx` real
  // que esta lectura simplificada no entienda sería peor que dejar pasar el caso raro que
  // de verdad no se puede leer así, y `validarArchivoSubido` ya confirmó que es un ZIP con
  // la forma de un `.xlsx` real.

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
    // Para que quien llama use el mismo nombre ya normalizado en sus propios mensajes
    // (ver `iniciarCargaFuentesFuturas`), en vez de repetir el normalizado con el crudo.
    nombreOriginal,
  };
}
