/**
 * Qué direcciones puede llevar el contenido que se pinta a otras personas.
 *
 * Vive en un paquete compartido por la misma razón que `@olo/slug-policy`: la regla la
 * aplican **cuatro** sitios y tienen que dar el mismo resultado. La API la usa al guardar
 * (`sanitizar-contenido.ts`), el sitio y la intranet al pintar (`href`, `src` de `iframe`)
 * y al redirigir tras el login, y las dos `next.config` para armar `frame-src` de la CSP
 * con **la misma lista de hosts** que valida el `iframe`.
 *
 * Nació de la auditoría del 2026-10-22 (`auditorias/2026-10-22-xss-almacenado-y-defensas.md`):
 * el sanitizador solo validaba las URLs de seis *nombres* de campo, y un `javascript:` en
 * `urlBoton`, `urlEnlace` o `urlPowerBi` se guardaba tal cual y se ejecutaba. La regla de
 * este paquete mira el **valor**, no el nombre del campo (XSS-01 de
 * `2-convenciones-del-proyecto.md` §11).
 *
 * Sin dependencias y sin DOM: corre igual en Node, en el navegador y en el proxy de Next.
 */

// ── Cómo lee un navegador un valor antes de decidir su esquema ────────────────

/**
 * El valor sin los caracteres que el navegador ignora al leer una URL: el espacio y los
 * controles del principio, y las tabulaciones y saltos de línea de en medio
 * (`java\tscript:` es `javascript:`). Se quitan **todos** los espacios y controles, no solo
 * los del principio: es una lectura más estricta que la del navegador, que es lo que se
 * quiere para decidir si algo es peligroso.
 */
/**
 * Rangos de código que el navegador ignora o lee como espacio: controles C0 y C1, espacio,
 * espacios Unicode, separadores de línea y de párrafo, caracteres de ancho cero y la marca de
 * orden de bytes. Van por número y no como escapes dentro de una expresión regular para que
 * ningún editor ni formateador los convierta en el carácter literal (un separador de línea
 * dentro de un literal de expresión regular rompe la compilación).
 */
const RANGOS_IGNORADOS: ReadonlyArray<readonly [number, number]> = [
  [0x0000, 0x0020],
  [0x007f, 0x00a0],
  [0x1680, 0x1680],
  [0x2000, 0x200f],
  [0x2028, 0x202f],
  [0x205f, 0x2064],
  [0x3000, 0x3000],
  [0xfeff, 0xfeff],
];

const CARACTERES_IGNORADOS = new RegExp(
  `[${RANGOS_IGNORADOS.map(([desde, hasta]) => `${String.fromCharCode(desde)}-${String.fromCharCode(hasta)}`).join('')}]`,
  'g'
);

const comoLoLeeElNavegador = (valor: string): string => valor.replace(CARACTERES_IGNORADOS, '').toLowerCase();

/** `http`, `https`, `mailto` y `tel`: lo único que un enlace puede tener como esquema. */
const ESQUEMAS_DE_ENLACE: readonly string[] = ['http:', 'https:', 'mailto:', 'tel:'];

/** Un `data:` con tipo de contenido o con parámetros: lo que el navegador trata como documento. */
const DOCUMENTO_EN_DATA = /^data:(?:[a-z0-9.+-]+\/[a-z0-9.+-]+|[;,])/;

/** Imágenes que pueden ir en un `data:`: no ejecutan nada ni dentro de un `<img>`. */
const DATA_DE_IMAGEN = /^data:image\/(?:png|jpe?g|gif|webp|avif|bmp|x-icon)[;,]/;

/**
 * ¿Es un esquema que ejecuta código o carga un documento activo?
 *
 * `javascript:`, `vbscript:` y `livescript:`, y cualquier `data:` que no sea una imagen
 * (`data:text/html,<script>…`). No mira el nombre del campo: si el valor empieza así, no
 * hay campo en el que sea inofensivo.
 *
 * Un texto corriente que empiece por «JavaScript:» (un título como «JavaScript: lo
 * básico») también cae aquí. Es el precio de no depender del nombre del campo: se
 * reconoce porque desaparece del contenido al guardar, y se arregla con otra redacción.
 * «Data: 2026» no cae: un `data:` solo es peligroso si trae un tipo de documento.
 */
export function esEsquemaEjecutable(valor: string): boolean {
  const n = comoLoLeeElNavegador(valor);
  if (/^(?:javascript|vbscript|livescript):/.test(n)) return true;
  // Un `data:` solo es un documento si trae tipo (`data:text/html`) o parámetros (`data:;base64`).
  if (DOCUMENTO_EN_DATA.test(n)) return !DATA_DE_IMAGEN.test(n);
  return false;
}

/** El esquema con el que empieza un valor (`https:`), o `null` si no tiene. */
const esquemaDe = (valor: string): string | null => {
  const coincidencia = /^([a-z][a-z0-9+.-]*:)/.exec(comoLoLeeElNavegador(valor));
  return coincidencia ? coincidencia[1] : null;
};

/** ¿Es una ruta de este mismo sitio (`/x`, `#x`, `?x`)? Una `//host` o `/\host` no lo es. */
const esRutaPropia = (valor: string): boolean => {
  if (valor.startsWith('#') || valor.startsWith('?')) return true;
  return valor.startsWith('/') && !valor.startsWith('//') && !valor.startsWith('/\\');
};

// ── Enlaces ──────────────────────────────────────────────────────────────────

/**
 * El valor de un `href`, o `''` si no se puede usar.
 *
 * Pasa una dirección `http(s)`, `mailto:` o `tel:`, una ruta del sitio (`/x`, `#x`, `?x`)
 * y una ruta relativa sin esquema (`archivo.pdf`). No pasa ningún otro esquema, ni
 * `//otro-sitio`, ni lo que no sea texto. Es la defensa del render: se usa aunque la API
 * ya haya saneado, porque el contenido también llega por otros caminos (editor sin
 * guardar, siembras, importaciones).
 */
export function enlaceSeguro(valor: unknown): string {
  if (typeof valor !== 'string') return '';
  const recortado = valor.trim();
  if (!recortado) return '';

  const esquema = esquemaDe(recortado);
  if (esquema) return ESQUEMAS_DE_ENLACE.includes(esquema) ? recortado : '';

  if (recortado.startsWith('/') || recortado.startsWith('\\')) return esRutaPropia(recortado) ? recortado : '';
  return recortado;
}

/**
 * El valor de un `src` de imagen o de un `url()` de CSS, o `''`.
 *
 * Como `enlaceSeguro`, pero sin `mailto:` ni `tel:` (no son imágenes) y con las imágenes
 * en `data:`, que el editor usa en las vistas previas.
 */
export function imagenSegura(valor: unknown): string {
  if (typeof valor !== 'string') return '';
  const recortado = valor.trim();
  if (!recortado) return '';
  if (DATA_DE_IMAGEN.test(comoLoLeeElNavegador(recortado))) return recortado;

  const seguro = enlaceSeguro(recortado);
  const esquema = esquemaDe(seguro);
  return esquema === 'mailto:' || esquema === 'tel:' ? '' : seguro;
}

// ── iframes ──────────────────────────────────────────────────────────────────

/**
 * Los sitios que pueden ir dentro de un `iframe`. **Una sola lista**: la validan la API al
 * guardar y los bloques al pintar, y de ella sale `frame-src` de la CSP (`directivaFrameSrc`).
 * Un `*.` delante es cualquier subdominio, no el dominio a secas.
 *
 *  - Power BI: los tableros del bloque «Tasa de vinculación» (`Publicar en la web`).
 *  - YouTube: los videos incrustados (`youtube-nocookie` es el que usa el sitio).
 *  - `*.sena.edu.co`: los micrositios de la institución.
 */
export const HOSTS_DE_IFRAME: readonly string[] = [
  'app.powerbi.com',
  'www.youtube.com',
  'www.youtube-nocookie.com',
  '*.sena.edu.co',
];

/** Direcciones de YouTube que se aceptan al guardar y que el bloque convierte en `/embed/…`. */
const HOSTS_DE_YOUTUBE_AL_GUARDAR: readonly string[] = ['youtube.com', 'm.youtube.com', 'youtu.be'];

const hostCoincide = (host: string, patron: string): boolean =>
  patron.startsWith('*.') ? host.endsWith(patron.slice(1)) && host.length > patron.length - 1 : host === patron;

/**
 * El valor de un `src` de `iframe`, o `''`.
 *
 * Solo `https://` y solo un host de `HOSTS_DE_IFRAME`. Con `alAguardar` también se aceptan
 * las direcciones de la barra de YouTube (`youtube.com/watch?v=`, `youtu.be/`), que el
 * bloque convierte en la de inserción antes de pintarla y vuelve a validar.
 *
 * Nada de rutas relativas ni de `javascript:`: en un `iframe`, un `src="javascript:…"` se
 * ejecuta al cargar la página, sin que nadie pulse nada.
 */
export function iframeSeguro(valor: unknown, { alAguardar = false }: { alAguardar?: boolean } = {}): string {
  if (typeof valor !== 'string') return '';
  const recortado = valor.trim();
  if (!recortado) return '';

  let url: URL;
  try {
    url = new URL(recortado);
  } catch {
    return '';
  }
  if (url.protocol !== 'https:' || url.username || url.password) return '';

  const host = url.hostname.toLowerCase();
  const permitidos = alAguardar ? [...HOSTS_DE_IFRAME, ...HOSTS_DE_YOUTUBE_AL_GUARDAR] : HOSTS_DE_IFRAME;
  return permitidos.some((patron) => hostCoincide(host, patron)) ? recortado : '';
}

/**
 * Los únicos orígenes, además del propio, de los que se carga un script. Vacía desde el
 * 2026-10-22: pdf.js, que era lo único que venía de fuera (`cdnjs.cloudflare.com`), se sirve
 * desde `public/assets/pdfjs/` de cada app. Un origen nuevo aquí es una decisión de seguridad:
 * se justifica en un comentario y se prefiere servir el archivo desde el propio origen.
 */
export const HOSTS_DE_SCRIPT: readonly string[] = [];

/** Lo que se escribe en `script-src` de la CSP, sin `'unsafe-eval'` (solo lo pide Next en desarrollo). */
export function directivaScriptSrc(): string {
  return ["'self'", "'unsafe-inline'", ...HOSTS_DE_SCRIPT.map((host) => `https://${host}`)].join(' ');
}

/**
 * Lo que se escribe en `frame-src` de la CSP: la propia página (el visor de PDF del sitio
 * es un `iframe` a `/api/docs/pdf`) y los hosts de `HOSTS_DE_IFRAME`.
 */
export function directivaFrameSrc(): string {
  return ["'self'", ...HOSTS_DE_IFRAME.map((host) => `https://${host}`)].join(' ');
}

/**
 * Atributos de seguridad de todo `iframe` de contenido: el marco no puede navegar la
 * página que lo contiene (`allow-top-navigation` no está) ni heredar la referencia
 * completa de la URL.
 */
export const ATRIBUTOS_DE_IFRAME_SEGURO = {
  sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-downloads',
  referrerPolicy: 'strict-origin-when-cross-origin',
} as const;

// ── Redirecciones ────────────────────────────────────────────────────────────

/** Un carácter de control (C0 o C1) o una barra invertida, que el navegador trata como una barra. */
const tieneControlOBarraInvertida = (valor: string): boolean =>
  Array.from(valor).some((c) => {
    const codigo = c.charCodeAt(0);
    return codigo <= 0x1f || (codigo >= 0x7f && codigo <= 0x9f) || codigo === 0x5c;
  });

/**
 * A dónde volver tras el login (`?redirect=`): solo una ruta de este mismo sitio.
 *
 * `startsWith('/') && !startsWith('//')` **no basta**: el navegador lee `/\evil.example`
 * y `/<tab>/evil.example` como `//evil.example`, otro sitio. Aquí se descarta cualquier
 * valor con una barra invertida o un carácter de control, además de `//`, de modo que lo
 * que sale es siempre una ruta del propio origen.
 *
 * @param porDefecto - A dónde ir si el valor no sirve.
 */
export function rutaInternaSegura(valor: unknown, porDefecto: string): string {
  if (typeof valor !== 'string') return porDefecto;
  if (!valor.startsWith('/') || valor.startsWith('//')) return porDefecto;
  if (tieneControlOBarraInvertida(valor)) return porDefecto;
  return valor;
}
