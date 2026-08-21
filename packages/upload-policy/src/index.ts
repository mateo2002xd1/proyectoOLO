/**
 * Política de subida de archivos — única para todas las aplicaciones.
 *
 * Existía dos veces: la intranet tenía los cinco controles de §S1 y el sitio web no
 * tenía ninguno, así que `/api/upload` de sitio-web aceptaba cualquier archivo, de
 * cualquier tamaño, de quien fuera. No fue un descuido puntual: la corrección se
 * aplicó a una app y la otra quedó fuera de vista. Mientras la política viva copiada
 * en dos sitios eso vuelve a pasar, así que aquí solo hay una copia y las dos rutas
 * la llaman.
 *
 * El paquete no depende de `file-type`: la detección por *magic bytes* entra como
 * argumento. Así se mantiene sin dependencias —igual que `password-policy` y
 * `email-policy`— y cada app usa la versión de `file-type` que ya tiene instalada.
 *
 * @see 3-seguridad-del-proyecto.md §S1 (Subida de archivos — CRÍTICO)
 * @see 3-seguridad-del-proyecto.md §4.4 (Contenido y archivos)
 */

export interface TipoPermitido {
  /** Extensión canónica del tipo real, la que se usa en el nombre de salida. */
  ext: string;
  /** Límite de tamaño en bytes para este tipo. */
  maxBytes: number;
}

const MB = 1024 * 1024;

/**
 * Lista blanca, nunca lista negra: lo que no está aquí se rechaza.
 *
 * SVG está excluido a propósito y no por olvido — es XML, admite `<script>` y
 * handlers `on*`, y servido inline ejecuta JavaScript en nuestro origen.
 */
export const TIPOS_PERMITIDOS: Record<string, TipoPermitido> = {
  'image/jpeg': { ext: 'jpg', maxBytes: 10 * MB },
  'image/png': { ext: 'png', maxBytes: 10 * MB },
  'application/pdf': { ext: 'pdf', maxBytes: 50 * MB },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', maxBytes: 50 * MB },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'xlsx', maxBytes: 50 * MB },
  'application/msword': { ext: 'doc', maxBytes: 50 * MB },
  'application/vnd.ms-excel': { ext: 'xls', maxBytes: 50 * MB },
  'application/vnd.ms-powerpoint': { ext: 'ppt', maxBytes: 50 * MB },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', maxBytes: 50 * MB },
};

/**
 * El mayor de los límites por tipo.
 *
 * Sirve para cortar *antes* de detectar el tipo: si el archivo ya supera el máximo
 * absoluto, ningún tipo lo va a aceptar y no hay motivo para seguir analizándolo.
 */
export const LIMITE_ABSOLUTO_BYTES = Object.values(TIPOS_PERMITIDOS).reduce(
  (mayor, tipo) => Math.max(mayor, tipo.maxBytes),
  0
);

/** Lo que devuelve `fileTypeFromBuffer` y es lo único que necesitamos de él. */
export type DetectorDeTipo = (
  datos: Uint8Array
) => Promise<{ mime: string; ext: string } | undefined>;

export interface SubidaAceptada {
  ok: true;
  /** Nombre con el que debe escribirse en disco: UUID + extensión canónica. */
  nombreArchivo: string;
  ext: string;
  mime: string;
}

export interface SubidaRechazada {
  ok: false;
  /** Código HTTP que corresponde al motivo (400, 413, 415). */
  status: number;
  error: string;
}

export type ResultadoDeValidacion = SubidaAceptada | SubidaRechazada;

/**
 * Discrimina el resultado. Hay que usar esto y no `if (!resultado.ok)`.
 *
 * `sitio-web` compila con `strict: false`, y sin `strictNullChecks` TypeScript no
 * estrecha una unión discriminada por la verdad de su campo: dentro del `if` seguiría
 * viendo la unión entera y `resultado.error` no compila. Un type guard explícito sí
 * estrecha en las dos configuraciones, así que las dos apps pueden consumir esto igual
 * sin que ninguna tenga que cambiar su `tsconfig`.
 */
export function fueRechazada(resultado: ResultadoDeValidacion): resultado is SubidaRechazada {
  return !resultado.ok;
}

/**
 * Valida un archivo subido y devuelve el nombre con el que debe guardarse.
 *
 * Los cuatro controles que aplica, en este orden:
 *
 *  1. **Tamaño absoluto** — corta antes de analizar nada.
 *  2. **Tipo real por magic bytes** — se ignoran la extensión del nombre y el
 *     `Content-Type` declarado por el cliente, porque los dos se falsifican
 *     escribiéndolos.
 *  3. **Lista blanca** sobre el tipo *detectado*, no sobre el declarado.
 *  4. **Límite por tipo** — una imagen de 40 MB no es una imagen, es un ataque de
 *     disco disfrazado.
 *
 * El quinto control es el nombre: se devuelve un UUID con la extensión canónica del
 * tipo real. El nombre que mandó el cliente no llega al disco en ningún caso, lo que
 * cierra el path traversal en el origen en vez de intentar limpiarlo.
 *
 * @param datos Contenido completo del archivo.
 * @param detectarTipo Normalmente `fileTypeFromBuffer` de `file-type`.
 * @param generarId Normalmente `crypto.randomUUID`.
 */
export async function validarArchivoSubido(
  datos: Uint8Array,
  detectarTipo: DetectorDeTipo,
  generarId: () => string
): Promise<ResultadoDeValidacion> {
  if (datos.length === 0) {
    return { ok: false, status: 400, error: 'El archivo está vacío.' };
  }

  if (datos.length > LIMITE_ABSOLUTO_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `El archivo supera el límite máximo de ${LIMITE_ABSOLUTO_BYTES / MB} MB.`,
    };
  }

  const tipoDetectado = await detectarTipo(datos);

  if (!tipoDetectado) {
    return {
      ok: false,
      status: 415,
      error: 'No se pudo determinar el tipo de archivo. Solo se permiten imágenes y documentos.',
    };
  }

  const permitido = TIPOS_PERMITIDOS[tipoDetectado.mime];

  if (!permitido) {
    return {
      ok: false,
      status: 415,
      error:
        `Tipo de archivo no permitido: ${tipoDetectado.mime}. ` +
        'Solo se aceptan PDF, DOCX, XLSX, PPTX, JPG y PNG.',
    };
  }

  if (datos.length > permitido.maxBytes) {
    return {
      ok: false,
      status: 413,
      error: `El archivo supera el límite de ${permitido.maxBytes / MB} MB para este tipo.`,
    };
  }

  return {
    ok: true,
    nombreArchivo: `${generarId()}.${permitido.ext}`,
    ext: permitido.ext,
    mime: tipoDetectado.mime,
  };
}

/**
 * Comprueba que una URL de borrado apunte de verdad dentro del directorio de subidas.
 *
 * Dos capas, porque cada una tapa un agujero distinto: el prefijo `/uploads/` rechaza
 * lo que ni siquiera lo intenta, y comparar la ruta ya resuelta contra el directorio
 * atrapa los `..` que sobrevivieron a la normalización. La comparación exige el
 * separador final para que `/uploads-secretos/` no pase por ser un prefijo de texto.
 *
 * @param rutaResuelta Ruta absoluta ya pasada por `path.join`/`path.resolve`.
 * @param directorioDeSubidas Ruta absoluta del directorio permitido.
 * @param separador `path.sep`.
 */
export function esRutaDeSubidaSegura(
  url: string,
  rutaResuelta: string,
  directorioDeSubidas: string,
  separador: string
): boolean {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return false;
  return rutaResuelta.startsWith(directorioDeSubidas + separador);
}
