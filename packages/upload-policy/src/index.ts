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

/**
 * Subcarpeta de `uploads/` según la extensión canónica (la de `TIPOS_PERMITIDOS`,
 * ya verificada por magic bytes — nunca la que declaró el cliente).
 *
 * Agrupada por categoría y no por extensión exacta: jpg/png van juntas a
 * `imagenes` porque casi siempre se consultan como grupo ("dame las imágenes"),
 * no una extensión a la vez.
 */
export const CARPETA_POR_EXTENSION: Record<string, string> = {
  pdf: 'pdf',
  jpg: 'img',
  png: 'img',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  ppt: 'presentaciones',
  pptx: 'presentaciones',
};

/**
 * Resuelve la subcarpeta de `uploads/` para una extensión ya validada.
 * Si la extensión no está en el mapa (no debería pasar: viene de
 * `TIPOS_PERMITIDOS`), cae a `otros` en vez de reventar.
 */
export function resolverCarpetaPorExtension(ext: string): string {
  return CARPETA_POR_EXTENSION[ext.toLowerCase()] ?? 'otros';
}

/**
 * El `Content-Type` con el que se puede servir un archivo de `storage/`, o `null` si no
 * se sirve.
 *
 * Sale de `TIPOS_PERMITIDOS`: solo se entrega lo que se pudo subir. `jpeg` entra aparte
 * porque hay archivos de antes de esta política con esa extensión. SVG sigue fuera por
 * lo mismo que no se puede subir.
 */
const MIME_POR_EXTENSION: Record<string, string> = {
  ...Object.fromEntries(Object.entries(TIPOS_PERMITIDOS).map(([mime, { ext }]) => [ext, mime])),
  jpeg: 'image/jpeg',
};

export function mimeParaServir(nombreArchivo: string): string | null {
  const ext = nombreArchivo.split('.').pop()?.toLowerCase() ?? '';
  return MIME_POR_EXTENSION[ext] ?? null;
}

/** Lo que devuelve `fileTypeFromBuffer` y es lo único que necesitamos de él. */
export type DetectorDeTipo = (
  datos: Uint8Array
) => Promise<{ mime: string; ext: string } | undefined>;

/**
 * Los tres tipos de `TIPOS_PERMITIDOS` que son en realidad un ZIP (el formato Office Open
 * XML): el detector de magic bytes solo sabe que el primer archivo del ZIP empieza por
 * `word/`, `xl/` o `ppt/` — eso basta para decir "es un .docx", pero es EXACTAMENTE lo mismo
 * que trae un `.docm` con macros: la extensión con macros usa la misma carpeta interna, y la
 * única diferencia es un archivo más dentro del ZIP (`vbaProject.bin`) que el detector de
 * magic bytes no mira (SUB-04).
 */
const EXTENSIONES_OOXML = new Set(['docx', 'xlsx', 'pptx']);

/** Las tres rutas donde el estándar OOXML guarda el proyecto de macros, una por aplicación. */
const ENTRADAS_DE_MACROS = ['word/vbaProject.bin', 'xl/vbaProject.bin', 'ppt/vbaProject.bin'];

/** Una entrada del directorio central de un ZIP: lo mínimo que hace falta de cada una. */
export interface EntradaDeZip {
  nombre: string;
  /** Lo que pesa esta entrada ya descomprimida (el campo del directorio central, no una medición real). */
  tamanoDescomprimido: number;
}

/**
 * Lee el directorio central de un ZIP: el nombre y el tamaño descomprimido *declarado* de
 * cada entrada, sin descomprimir nada (ambos son campos del directorio central, que va sin
 * comprimir). Sirve de base a dos controles (SUB-01, SUB-04): cuánto pesaría el archivo
 * entero una vez abierto, y si trae una entrada de macros.
 *
 * Cada campo que se lee se acota siempre contra el tamaño real del buffer, así que leer
 * esto nunca reserva ni descomprime más de lo que el propio archivo ya pesa en disco.
 *
 * Devuelve `null` si el ZIP no tiene un directorio central con la forma esperada (truncado,
 * corrupto, o el caso raro de ZIP64 con más de 65 535 entradas, que ningún documento de
 * Office real alcanza): **a propósito**, porque esto es una segunda capa sobre la lista
 * blanca y el tamaño comprimido, no la única, y negarse a aceptar cualquier ZIP real que
 * esta lectura simplificada no entienda sería peor que dejar pasar el caso raro que de
 * verdad no se puede leer así. Quien llama decide qué hacer con `null`.
 */
export function leerDirectorioCentralDeZip(datos: Uint8Array): EntradaDeZip[] | null {
  // El "End Of Central Directory": 22 bytes fijos + hasta 65 535 de comentario, al final
  // del archivo. Se busca su firma desde el final hacia atrás, sin ir más allá del
  // comienzo del buffer.
  const EOCD_MIN = 22;
  const inicioBusqueda = Math.max(0, datos.length - EOCD_MIN - 65535);
  let posEocd = -1;
  for (let i = datos.length - EOCD_MIN; i >= inicioBusqueda; i--) {
    if (
      datos[i] === 0x50 &&
      datos[i + 1] === 0x4b &&
      datos[i + 2] === 0x05 &&
      datos[i + 3] === 0x06
    ) {
      posEocd = i;
      break;
    }
  }
  if (posEocd === -1) return null;

  const leerUint16 = (p: number) => datos[p] | (datos[p + 1] << 8);
  const leerUint32 = (p: number) => (datos[p] | (datos[p + 1] << 8) | (datos[p + 2] << 16) | (datos[p + 3] << 24)) >>> 0;

  const totalEntradas = leerUint16(posEocd + 10);
  let posEntrada = leerUint32(posEocd + 16);
  // 0xFFFFFFFF en cualquiera de los dos marca ZIP64, con el conteo y la posición reales en
  // un registro aparte que esta lectura simplificada no sigue: se trata como "no se pudo
  // verificar" (ver el porqué arriba de la función).
  if (totalEntradas === 0xffff || posEntrada === 0xffffffff) return null;

  const FIRMA_CDFH = 0x02014b50;
  const entradas: EntradaDeZip[] = [];
  for (let i = 0; i < totalEntradas; i++) {
    // Cabecera fija de 46 bytes; cualquier campo que se saldría del buffer deja el
    // directorio por sospechoso de corrupto, no por confirmado.
    if (posEntrada + 46 > datos.length) return null;
    if (leerUint32(posEntrada) !== FIRMA_CDFH) return null;

    const tamanoDescomprimido = leerUint32(posEntrada + 24);
    const longitudNombre = leerUint16(posEntrada + 28);
    const longitudExtra = leerUint16(posEntrada + 30);
    const longitudComentario = leerUint16(posEntrada + 32);
    const inicioNombre = posEntrada + 46;
    if (inicioNombre + longitudNombre > datos.length) return null;

    // `TextDecoder` y no `Buffer`: este paquete no asume Node (ver la nota de arriba del
    // archivo). Los nombres que importan a quien llama son ASCII siempre, así que basta con esto.
    const nombre = new TextDecoder().decode(datos.slice(inicioNombre, inicioNombre + longitudNombre));
    entradas.push({ nombre, tamanoDescomprimido });

    posEntrada = inicioNombre + longitudNombre + longitudExtra + longitudComentario;
  }
  return entradas;
}

/**
 * ¿Trae este ZIP una de las tres entradas de macros? `null` del directorio central (no se
 * pudo leer) se trata igual que `false`: ver el porqué en `leerDirectorioCentralDeZip`.
 */
function traeProyectoDeMacros(datos: Uint8Array): boolean {
  const entradas = leerDirectorioCentralDeZip(datos);
  return entradas?.some((e) => ENTRADAS_DE_MACROS.includes(e.nombre)) ?? false;
}

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

  // SUB-04: un .docm/.xlsm/.pptm se detecta por magic bytes como su contraparte sin
  // macros (misma carpeta interna del ZIP); esta es la única diferencia que el detector
  // de tipo no mira. Va después de la lista blanca y antes de aceptar, no al revés: un
  // PDF o una imagen nunca pasan por aquí.
  if (EXTENSIONES_OOXML.has(permitido.ext) && traeProyectoDeMacros(datos)) {
    return {
      ok: false,
      status: 415,
      error: 'El documento trae macros. Guárdalo sin macros antes de subirlo.',
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

/** Cuántos caracteres del nombre original de un archivo se conservan. */
const LARGO_MAXIMO_NOMBRE = 120;

/**
 * El nombre original de un archivo (`nombreOriginal`/`nombre_original`), tal cual lo
 * manda el navegador, nunca se usa para escribir en disco (SUB-05): eso ya lo cierra el
 * nombre UUID que devuelve `validarArchivoSubido`. Pero ese nombre original SÍ viaja —en
 * el contenido de la página, en el historial de cargas— y se pinta como texto o como
 * nombre de descarga en varias pantallas. Sin normalizar, tres cosas podían pasar: un
 * carácter de control o de control de dirección de texto (RTL) alteraba cómo se lee el
 * nombre en pantalla; un nombre largo desbordaba el layout; y un `%` suelto delataba que
 * nadie decodifica esto con cuidado.
 *
 * Esto no reemplaza el `try/catch` de quien decodifica después (`nombreDeArchivoDecodificado`
 * en `@olo/url-policy`): un nombre ya sembrado antes de este cambio sigue necesitando esa
 * defensa. Esto es para que los nombres NUEVOS salgan limpios desde el origen.
 */
export function normalizarNombreOriginal(nombre: unknown): string {
  if (typeof nombre !== 'string' || nombre.length === 0) return 'archivo';

  const sinControlNiBidi = nombre
    .normalize('NFC')
    // Controles ASCII (incluido DEL) y los seis marcadores de dirección de texto que
    // Unicode define para forzar RTL/LTR: ninguno debe sobrevivir a un nombre de archivo.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f‎‏‪-‮⁦-⁩]/g, '');

  const limpio = sinControlNiBidi.trim();
  return limpio.length === 0 ? 'archivo' : limpio.slice(0, LARGO_MAXIMO_NOMBRE);
}
