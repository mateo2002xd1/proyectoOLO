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

// ---------------------------------------------------------------------------
// Instancia de DOMPurify con el window de jsdom
// ---------------------------------------------------------------------------

const { window: jsdomWindow } = new JSDOM('');
// jsdom's Window type doesn't perfectly match DOMPurify's WindowLike — the cast
// is safe because DOMPurify only uses a small subset of DOM APIs that jsdom provides.
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

/** Atributos permitidos en las etiquetas anteriores. */
const ATRIBUTOS_PERMITIDOS = [
  'href', 'src', 'alt', 'title', 'class', 'id',
  'target', 'rel', 'width', 'height',
  'colspan', 'rowspan',
  'data-type', 'data-id',  // atributos de datos de Puck (internos, no peligrosos)
];

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
 */
const CAMPOS_URL = new Set(['src', 'href', 'url', 'link', 'backgroundimage', 'imageurl']);

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
function sanitizarValor(valor: unknown, clave: string): unknown {
  if (typeof valor === 'string') {
    if (CAMPOS_URL.has(clave)) return sanitizarUrl(valor);
    return valor.includes('<') ? sanitizarHtml(valor) : valor;
  }
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
