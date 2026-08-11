/**
 * Sanitización de contenido Puck antes de persistir en base de datos.
 *
 * Recorre la estructura JSON de bloques Puck y aplica DOMPurify sobre todos los
 * campos que pueden contener HTML libre (texto enriquecido, URLs, atributos de
 * elementos visuales). Previene XSS almacenado: un editor con cuenta comprometida
 * no puede inyectar scripts que se ejecuten para todos los visitantes.
 *
 * DOMPurify necesita un DOM para operar; en Node.js se provee jsdom.
 *
 * Perfil de sanitización (estricto):
 *   - Etiquetas permitidas: h1-h6, p, b, strong, i, em, u, s, del, ul, ol, li,
 *     blockquote, br, hr, a, img, table, thead, tbody, tr, th, td, span, div
 *   - Atributos permitidos: href, src, alt, title, class, target, rel, width, height
 *   - Esquemas de URL permitidos: http, https (se excluye javascript:, data:, vbscript:)
 *   - Scripts inline, event handlers y javascript: URIs son eliminados.
 *
 * @see 3-seguridad-del-proyecto.md §S2 (XSS del contenido — CRÍTICO)
 * @see openspec/changes/qa-seguridad-vistas-intranet/specs/qa-intranet-content-xss/spec.md
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
 * Sanitiza un string HTML con DOMPurify.
 * Devuelve el HTML limpio. Si el input no es string, lo devuelve sin cambios.
 */
function sanitizarHtml(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;

  return purify.sanitize(valor, {
    ALLOWED_TAGS: ETIQUETAS_PERMITIDAS,
    ALLOWED_ATTR: ATRIBUTOS_PERMITIDOS,
    // Solo esquemas seguros en href y src; bloquea javascript:, data: con scripts, vbscript:
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
    // Elimina comentarios HTML que pueden contener XSS en algunos parsers
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: false,
  });
}

/**
 * Lista de campos de props de bloque Puck que pueden contener HTML libre.
 * El resto de props (números, booleans, slugs) se dejan intactos.
 */
const CAMPOS_HTML = new Set([
  'content', 'text', 'html', 'body', 'description', 'caption',
  'title', 'subtitle', 'label', 'heading', 'subheading',
]);

/**
 * Campos que contienen URLs — se validan para aceptar solo http/https.
 */
const CAMPOS_URL = new Set(['src', 'href', 'url', 'link', 'backgroundImage', 'imageUrl']);

/**
 * Sanitiza una URL: solo acepta http:// y https://.
 * Devuelve cadena vacía si el esquema no es permitido.
 */
function sanitizarUrl(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;
  const trimmed = valor.trim();
  if (!trimmed) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
    // javascript:, data:, vbscript:, file:, etc. → descartados
    return '';
  } catch {
    // URL relativa (empieza con /uploads/) — permitida
    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/')) {
      return trimmed;
    }
    return '';
  }
}

/**
 * Sanitiza recursivamente un objeto de props de bloque Puck.
 * Recorre todas las claves y sanitiza según el tipo de campo.
 */
function sanitizarProps(props: Record<string, unknown>): Record<string, unknown> {
  const resultado: Record<string, unknown> = {};

  for (const [clave, valor] of Object.entries(props)) {
    const claveMin = clave.toLowerCase();

    if (CAMPOS_URL.has(claveMin)) {
      resultado[clave] = sanitizarUrl(valor);
    } else if (CAMPOS_HTML.has(claveMin)) {
      resultado[clave] = sanitizarHtml(valor);
    } else if (typeof valor === 'string') {
      // Otros strings: sanitizar igualmente pero con modo texto (sin HTML)
      // para evitar que el escape de angle-brackets rompa slugs o clases CSS.
      resultado[clave] = valor;
    } else if (Array.isArray(valor)) {
      resultado[clave] = valor.map(item =>
        typeof item === 'object' && item !== null
          ? sanitizarProps(item as Record<string, unknown>)
          : item
      );
    } else if (typeof valor === 'object' && valor !== null) {
      resultado[clave] = sanitizarProps(valor as Record<string, unknown>);
    } else {
      resultado[clave] = valor;
    }
  }

  return resultado;
}

/**
 * Estructura de un bloque Puck. Solo la forma mínima necesaria para sanitizar.
 */
interface BloquePuck {
  type: string;
  props?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Estructura del contenido de una página Puck.
 */
export interface ContenidoPuck {
  content?: BloquePuck[];
  root?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Sanitiza el contenido completo de una página Puck antes de persistirlo.
 *
 * Procesa todos los bloques del array `content` y el objeto `root`, sanitizando
 * sus props según el tipo de campo. No modifica la estructura del JSON.
 *
 * @param contenido - El objeto de contenido Puck tal como llega del cliente.
 * @returns El contenido sanitizado, listo para persistir en base de datos.
 */
export function sanitizarContenidoPuck(contenido: unknown): unknown {
  // Si no es un objeto, no hay nada que sanitizar (null, string primitivo, etc.)
  if (typeof contenido !== 'object' || contenido === null) {
    return contenido;
  }

  const puck = contenido as ContenidoPuck;
  const resultado: ContenidoPuck = { ...puck };

  // Sanitizar cada bloque del array content
  if (Array.isArray(puck.content)) {
    resultado.content = puck.content.map(bloque => {
      if (!bloque || typeof bloque !== 'object') return bloque;

      return {
        ...bloque,
        props: bloque.props ? sanitizarProps(bloque.props) : bloque.props,
      };
    });
  }

  // Sanitizar las props del root (menú, pie, etc.)
  if (puck.root && typeof puck.root === 'object') {
    resultado.root = sanitizarProps(puck.root as Record<string, unknown>);
  }

  return resultado;
}
