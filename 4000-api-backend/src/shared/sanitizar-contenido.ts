/**
 * Sanitización de contenido Puck antes de persistir en base de datos.
 *
 * Recorre TODO el JSON de una página —`content`, `root`, `zones` y lo que haya dentro
 * de cada prop, a cualquier profundidad— y pasa por DOMPurify cada texto que contenga
 * `<`. Previene XSS almacenado: un editor con cuenta comprometida no puede inyectar
 * scripts que se ejecuten para todos los visitantes.
 *
 * **Por qué `<` y no una lista de campos.** Hasta el 2026-09-25 se saneaban solo los
 * campos con nombre de HTML (`content`, `titulo`, `texto`…), y la lista se quedaba
 * atrás de los bloques. Tres huecos reales:
 *   - el bloque «Texto enriquecido» guarda en `content` el objeto de EditorJS
 *     (`{ blocks: [{ data: { text, items } }] }`), no un texto, y el objeto pasaba
 *     sin tocar aunque `editorjs-wrapper.tsx` pinta ese `text` con `dangerouslySetInnerHTML`;
 *   - los campos `richtext` llamados `intro` no estaban en la lista;
 *   - los bloques dentro de una `DropZone` viven en `zones`, que no se recorría.
 * Sin `<` no hay etiqueta que inyectar: un texto sin ese carácter se pinta igual como
 * HTML o como texto, así que no hace falta saber qué campo es HTML.
 *
 * **Las URLs se validan por su valor** (`sanitizarTexto`), no por el nombre del campo: un
 * texto sin `<` no es HTML pero puede ser un `javascript:` que se ejecuta al pulsarlo.
 *
 * Perfil de sanitización (estricto):
 *   - Etiquetas y atributos: los de ETIQUETAS_PERMITIDAS y ATRIBUTOS_PERMITIDOS.
 *   - Enlaces e imágenes: http, https, mailto, tel y rutas relativas (`/estudios`,
 *     `#seccion`). Se eliminan `javascript:`, `data:` y `vbscript:`.
 *   - Scripts inline y event handlers (`onerror`, `onclick`…) se eliminan siempre.
 *
 * DOMPurify necesita un DOM para operar; en Node.js se provee jsdom.
 *
 * @see 3-seguridad-del-proyecto.md §S2 (XSS del contenido — CRÍTICO)
 */

import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { esEsquemaEjecutable, iframeSeguro, rutaInternaSegura } from '@olo/url-policy';

// ---------------------------------------------------------------------------
// Instancia de DOMPurify con el window de jsdom
// ---------------------------------------------------------------------------

const { window: jsdomWindow } = new JSDOM('');
// El tipo `Window` de jsdom no encaja del todo con el `WindowLike` que espera DOMPurify.
// El cast es seguro: DOMPurify solo usa un subconjunto pequeño del DOM, que jsdom sí trae.
const purify = DOMPurify(jsdomWindow as unknown as Parameters<typeof DOMPurify>[0]);


/** Etiquetas HTML permitidas en contenido editorial. */
const ETIQUETAS_PERMITIDAS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'b', 'strong', 'i', 'em', 'u', 's', 'del', 'mark',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div', 'section', 'article',
  'figure', 'figcaption',
];

/**
 * Atributos permitidos en las etiquetas anteriores (XSS-09: cada uno abre algo, y aquí se dice qué).
 *
 *  - `href`, `src`: llevan direcciones; `URI_PERMITIDA` deja fuera `javascript:` y los `data:`.
 *  - `target`, `rel`: sin ellos un enlace no puede abrirse en otra pestaña; `rel` se conserva
 *    para no perder `noopener`.
 *  - `style`: solo la alineación y, en un `span`, un color `#hex` (hook de `ALINEACION_PERMITIDA`
 *    y `COLOR_PERMITIDO`).
 *  - **No hay `class` ni `id`** (quitados el 2026-10-22). Ningún editor del OLO está configurado para escribirlos (ni
 *    la barra de Puck ni las herramientas de EditorJS que se cargan), y los dos son superficie:
 *    una clase de utilidad de Tailwind (`fixed inset-0 z-50 bg-white`) tapa la página entera igual
 *    que el `style` que ya se bloqueó, y un `id` como `location` o `cookie` pisa propiedades de
 *    `document` (DOM clobbering). Si un bloque llegara a necesitar una clase, se añade aquí
 *    con una lista cerrada de valores, no como atributo libre.
 */
const ATRIBUTOS_PERMITIDOS = [
  'href', 'src', 'alt', 'title',
  'target', 'rel', 'width', 'height',
  'colspan', 'rowspan',
  'data-type', 'data-id',  // atributos de datos de Puck (internos, no peligrosos)
  'style',  // solo `text-align` y, en un `span`, `color:#hex`: lo demás lo quita el hook de más abajo
];

/**
 * El único `style` que se guarda: la alineación que pone la barra de formato de Puck
 * (`style="text-align: center"` en un párrafo o encabezado). Cualquier otro `style` se
 * borra entero, como antes de que existiera la barra: un `style` libre deja tapar la
 * página con un bloque o pintar un texto invisible.
 */
const ALINEACION_PERMITIDA = /^\s*text-align:\s*(left|center|right|justify)\s*;?\s*$/i;

/**
 * El otro `style` que se guarda: el color de unas palabras, `<span style="color:#aa0000">` (la
 * herramienta «Color del texto» de Editor.js, `features/editor/edition/lib/editorjs-color.ts` del
 * sitio web). Solo en un `span` y solo con un `#hex` de 3 o 6 dígitos: sin nombres de color,
 * `rgb()`, `var()`, `url()`, `!important` ni otras propiedades. Es de lo único que el `style`
 * puede llevar además de la alineación; si la herramienta cambia su formato, cambia esta regla.
 */
const COLOR_PERMITIDO = /^\s*color:\s*#(?:[0-9a-f]{3}|[0-9a-f]{6})\s*;?\s*$/i;

purify.addHook('uponSanitizeAttribute', (nodo, datos) => {
  if (datos.attrName !== 'style') return;
  const esAlineacion = ALINEACION_PERMITIDA.test(datos.attrValue);
  const esColorDeSpan = nodo.nodeName === 'SPAN' && COLOR_PERMITIDO.test(datos.attrValue);
  if (!esAlineacion && !esColorDeSpan) datos.keepAttr = false;
});

/**
 * Qué puede ir en `href` y `src`: http(s), mailto y tel, o una ruta relativa. Es el
 * patrón por defecto de DOMPurify sin los esquemas raros: lo que empieza con letras
 * seguidas de `:` tiene que ser uno de los permitidos, y eso deja fuera `javascript:`.
 * Con el patrón anterior (`^(?:https?|mailto):`) un enlace a `/estudios` perdía el href.
 */
const URI_PERMITIDA = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

/**
 * Lo que DOMPurify quitó y sí era peligroso, para `htmlPeligrosoEn`. Un `style` o una
 * etiqueta fuera de la lista también se quitan, pero no son un ataque.
 */
const ETIQUETAS_PELIGROSAS = new Set(['script', 'iframe', 'object', 'embed', 'svg', 'math', 'form', 'link', 'meta', 'base', 'style']);
let recolector: ((quitado: string) => void) | null = null;

/** Sanitiza un string HTML con DOMPurify y devuelve el HTML limpio. */
function sanitizarHtml(valor: string): string {
  const limpio = purify.sanitize(valor, {
    ALLOWED_TAGS: ETIQUETAS_PERMITIDAS,
    ALLOWED_ATTR: ATRIBUTOS_PERMITIDOS,
    ALLOWED_URI_REGEXP: URI_PERMITIDA,
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: false,
  });
  if (recolector) {
    for (const quitado of purify.removed as Array<{ element?: Element; attribute?: Attr | null; from?: Element }>) {
      if (quitado.attribute) {
        const { name, value } = quitado.attribute;
        if (/^on/i.test(name) || /^\s*(javascript|vbscript|data):/i.test(value)) recolector(`${name}="${value.slice(0, 40)}"`);
      } else if (quitado.element) {
        const nombre = quitado.element.nodeName.toLowerCase();
        if (ETIQUETAS_PELIGROSAS.has(nombre)) recolector(`<${nombre}>`);
      }
    }
  }
  return limpio;
}

/**
 * Campos que contienen URLs sueltas (no dentro de HTML): se validan aparte, porque
 * pueden ir a un `href` o a un `src` sin pasar por DOMPurify. En minúsculas: la clave
 * se compara en minúsculas (`backgroundImage` → `backgroundimage`).
 *
 * **Esta lista ya no es la defensa, es la parte estricta de ella.** Hasta el 2026-10-22 era
 * la única: `urlBoton`, `urlEnlace`, `urlDestino`, `urlPowerBi`… no estaban y guardaban
 * `javascript:` tal cual (`auditorias/2026-10-22-xss-almacenado-y-defensas.md`). Lo que
 * cierra ese hueco es `sanitizarTexto`, que mira el **valor** de cualquier campo.
 */
const CAMPOS_URL = new Set(['src', 'href', 'url', 'link', 'backgroundimage', 'imageurl']);

/**
 * Campos cuyo valor acaba en el `src` de un `iframe`: solo pasa una dirección de la lista
 * de hosts de `@olo/url-policy` (la misma que usa `frame-src` de la CSP). Un `javascript:` ahí
 * se ejecutaría al cargar la página, sin que nadie pulse nada.
 */
const CAMPOS_IFRAME = new Set(['urlpowerbi', 'videourl', 'embedurl', 'iframeurl']);

/** Nombres de campo que, por su aspecto, llevan una dirección (en minúsculas). */
const CLAVE_DE_DIRECCION = /(url|href|src|link|enlace|destino|ruta|archivo|imagen|icono|logo|miniatura|poster|video|action|background)/;

/**
 * Campos de color de los bloques (`colorFondo`, `colorFilaHover`…; en minúsculas). Su valor acaba en un
 * `style` o en una variable CSS, y el selector de color de Puck deja escribir texto libre: una
 * petición directa a la API puede mandar `#fff;} body::before{…}`. Solo se guarda un color de
 * verdad (XSS-07, `2-convenciones-del-proyecto.md` §11).
 */
const CLAVE_DE_COLOR = /^color/;

/**
 * Lo que se admite como color: hex, `rgb()`/`hsl()` con solo números, una variable del tema o un nombre
 * (`red`, `transparent`). Es el mismo criterio que `colorSeguro` del buscador del sitio
 * (`3000-sitio-web/.../buscador-sitio/lib/colores.ts`): si cambia uno, cambia el otro.
 */
const COLOR_ADMITIDO = new RegExp(
  '^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgb|hsl)a?\\(\\s*[\\d.%\\s,/-]+\\)|var\\(--[a-z0-9-]+\\)|[a-z]{3,30})$',
  'i'
);

/**
 * Campos que guardan una ruta de ESTE sitio y de ahí navegan el visitante (el «Buscador del Sitio
 * Web» va a la página que se escriba aquí). Un valor como `//otro-sitio` o `/\otro-sitio` lo lee el
 * navegador como otro origen, y su nombre no se parece a una dirección (`CLAVE_DE_DIRECCION`); se
 * nombra aquí. Solo pasa `/ruta` de este mismo sitio (XSS-06).
 */
const CAMPOS_RUTA_INTERNA = new Set(['paginaresultados']);

/** Los esquemas que puede tener la dirección de un campo así. `data:` ya pasó por `esEsquemaEjecutable`. */
const ESQUEMAS_ADMITIDOS_EN_DIRECCION = new Set(['http', 'https', 'mailto', 'tel', 'data']);

/**
 * Sanitiza una URL: acepta http(s), mailto, tel y rutas relativas (`/uploads/…`,
 * `#seccion`, `?pagina=2`). Devuelve cadena vacía si el esquema no es permitido.
 */
function sanitizarUrl(valor: string): string {
  const trimmed = valor.trim();
  if (!trimmed) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return trimmed;
    }
    // javascript:, data:, vbscript:, file:, etc. → descartados
    if (recolector && /^(javascript|vbscript|data):$/i.test(parsed.protocol)) recolector(`url ${trimmed.slice(0, 40)}`);
    return '';
  } catch {
    // Ruta relativa: no tiene esquema, así que no puede ser javascript:.
    if (/^[/#?]/.test(trimmed)) {
      return trimmed;
    }
    return '';
  }
}

/**
 * Sanea un valor a cualquier profundidad. Un texto dentro de un arreglo hereda la
 * clave del arreglo (los `items` de una lista de EditorJS son textos sueltos).
 */
/**
 * Sanea un texto según **lo que dice**, no solo según cómo se llama su campo (XSS-01).
 *
 *  1. Si empieza por un esquema que ejecuta código (`javascript:`, `vbscript:`, un
 *     `data:` que no sea imagen) se vacía, en cualquier campo: no hay campo donde sea
 *     inofensivo.
 *  2. Un campo de color (`color*`) solo admite un color: hex, `rgb()`/`hsl()` numéricos, una
 *     variable del tema o un nombre. Cualquier otra cosa se vacía (XSS-07).
 *  3. Un campo de ruta interna (`paginaResultados`) solo admite `/ruta` de este sitio (XSS-06).
 *  4. Un campo de `iframe` solo admite un host de la lista.
 *  5. Un campo de la lista estricta (`src`, `href`…) solo admite http, https, mailto, tel o
 *     una ruta relativa.
 *  6. Un campo con aspecto de dirección (`urlBoton`, `archivo`, `icono`…) que empieza por
 *     un esquema solo admite los de enlace. Un texto sin esquema pasa.
 *  7. Lo demás: si tiene `<`, DOMPurify.
 */
function sanitizarTexto(valor: string, clave: string): string {
  if (esEsquemaEjecutable(valor)) {
    recolector?.(`url ${valor.trim().slice(0, 40)}`);
    return '';
  }

  if (CLAVE_DE_COLOR.test(clave) && valor.trim() && !COLOR_ADMITIDO.test(valor.trim())) {
    recolector?.(`color ${valor.trim().slice(0, 40)}`);
    return '';
  }

  if (CAMPOS_RUTA_INTERNA.has(clave) && valor.trim()) {
    const escrita = valor.trim();
    // Con esquema (`https://…`) no es una ruta de este sitio: no se arregla poniéndole una barra.
    const segura = /^[a-z][a-z0-9+.-]*:/i.test(escrita)
      ? ''
      : rutaInternaSegura(escrita.startsWith('/') ? escrita : `/${escrita}`, '');
    if (!segura) recolector?.(`ruta ${escrita.slice(0, 40)}`);
    return segura;
  }

  if (CAMPOS_IFRAME.has(clave)) {
    const seguro = iframeSeguro(valor, { alAguardar: true });
    if (!seguro && valor.trim()) recolector?.(`iframe ${valor.trim().slice(0, 40)}`);
    return seguro;
  }

  if (CAMPOS_URL.has(clave)) return sanitizarUrl(valor);

  if (CLAVE_DE_DIRECCION.test(clave)) {
    const esquema = /^([a-z][a-z0-9+.-]*):\S/i.exec(valor.trim())?.[1]?.toLowerCase();
    if (esquema && !ESQUEMAS_ADMITIDOS_EN_DIRECCION.has(esquema)) {
      recolector?.(`url ${valor.trim().slice(0, 40)}`);
      return '';
    }
  }

  return valor.includes('<') ? sanitizarHtml(valor) : valor;
}

function sanitizarValor(valor: unknown, clave: string): unknown {
  if (typeof valor === 'string') return sanitizarTexto(valor, clave);
  if (Array.isArray(valor)) return valor.map((item) => sanitizarValor(item, clave));
  if (typeof valor === 'object' && valor !== null) {
    const resultado: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor)) resultado[k] = sanitizarValor(v, k.toLowerCase());
    return resultado;
  }
  return valor;
}

/**
 * Sanitiza el contenido completo de una página Puck antes de persistirlo.
 *
 * Recorre el objeto entero —`content`, `root`, `zones` y cualquier clave nueva que
 * traiga Puck— sin cambiar su forma: solo limpia textos con `<` y URLs sueltas.
 *
 * @param contenido - El objeto de contenido Puck tal como llega del cliente.
 * @returns El contenido sanitizado, listo para persistir en base de datos.
 */
export function sanitizarContenidoPuck(contenido: unknown): unknown {
  // Si no es un objeto, no hay nada que sanitizar (null, string primitivo, etc.)
  if (typeof contenido !== 'object' || contenido === null) {
    return contenido;
  }
  return sanitizarValor(contenido, '');
}

/**
 * Lo peligroso que `sanitizarContenidoPuck` le quitaría a un contenido ya guardado:
 * etiquetas como `<script>` o `<iframe>`, atributos `on…` y enlaces `javascript:`.
 * Vacío si no hay nada. Sirve para revisar versiones guardadas antes de que se
 * saneara todo el contenido.
 */
export function htmlPeligrosoEn(contenido: unknown): string[] {
  const encontrados: string[] = [];
  recolector = (quitado) => encontrados.push(quitado);
  try {
    sanitizarContenidoPuck(contenido);
  } finally {
    recolector = null;
  }
  return encontrados;
}
