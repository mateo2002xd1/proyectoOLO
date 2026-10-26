import type { OutputBlockData, OutputData } from '@editorjs/editorjs';

/**
 * Los textos de la sección «¿Sabes qué es una ocupación?» de la portada, en dos campos de
 * Editor.js:
 *
 *  - «Textos del buscador» (`contenido`): cada bloque va a una zona según su tipo. El
 *    encabezado es el titular, arriba; el párrafo y la lista son la descripción, bajo el titular.
 *  - «Texto bloque» (`textoBloque`): el texto del recuadro azul, sobre el buscador. Va aparte;
 *    todos sus bloques salen ahí.
 *
 * Antes eran tres campos `richtext` de Puck (`tituloSeccion`, `descripcion` y `titulo`), y
 * durante un tiempo el texto del recuadro fue la «cita» de `contenido`. Una portada guardada
 * así se pinta como siempre hasta que se abre en el editor, y entonces se pasa a los campos
 * nuevos (`contenidoDesdeHtml`, `textoBloqueDesdeHtml`, `separarCitas`).
 */
export interface TextosRepartidos {
  titular: OutputBlockData[];
  descripcion: OutputBlockData[];
}

/** El HTML de los tres campos `richtext` de antes. */
export interface TextosEnHtml {
  tituloSeccion?: string;
  descripcion?: string;
  titulo?: string;
}

/** Los textos del diseño, tal como los traía la portada recién puesta. */
export const TEXTOS_EN_HTML_POR_DEFECTO: Required<TextosEnHtml> = {
  tituloSeccion: '<p>¿Sabes qué es una<br><strong>ocupación?</strong></p>',
  descripcion:
    '<p>Es un conjunto de cargos, empleos u oficios que incluyen categorías homogéneas de funciones, independientemente del lugar o tiempo donde se desarrollen.</p>',
  titulo:
    '<p><em>Explora las ocupaciones clave de los</em> <strong>sectores productivos en Colombia.</strong></p>',
};

/** El texto de un bloque sin etiquetas ni espacios, para saber si dice algo. */
function textoPlano(html: unknown): string {
  return String(html ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/** Si el bloque dice algo; los de otro tipo (imagen, separador…) cuentan como vacíos. */
export function tieneTexto(bloque?: OutputBlockData): boolean {
  if (!bloque) return false;
  if (bloque.type === 'list') return Array.isArray(bloque.data?.items) && bloque.data.items.length > 0;
  return textoPlano(bloque.data?.text) !== '';
}

/**
 * La alineación elegida para un bloque (el ajuste `alineacion` de Editor.js,
 * `features/editor/edition/lib/editorjs-alineacion.ts`); a la izquierda, que es la de siempre,
 * no hay nada que aplicar.
 */
export function alineacionDe(bloque: OutputBlockData): 'center' | 'right' | 'justify' | undefined {
  const valor = bloque.tunes?.alineacion?.alineacion;
  return valor === 'center' || valor === 'right' || valor === 'justify' ? valor : undefined;
}

function bloquesDe(contenido?: OutputData): OutputBlockData[] {
  const bloques = contenido?.blocks;
  return Array.isArray(bloques) ? bloques : [];
}

/** Reparte los bloques de `contenido` entre el titular y la descripción; el resto se descarta. */
export function repartirTextos(contenido?: OutputData): TextosRepartidos {
  const reparto: TextosRepartidos = { titular: [], descripcion: [] };
  for (const bloque of bloquesDe(contenido)) {
    if (!tieneTexto(bloque)) continue;
    if (bloque.type === 'header') reparto.titular.push(bloque);
    else if (bloque.type === 'paragraph' || bloque.type === 'list') reparto.descripcion.push(bloque);
  }
  return reparto;
}

/**
 * Las citas que `contenido` llevó cuando el texto del recuadro era una cita de ese campo, y
 * lo que queda sin ellas. El campo ya no ofrece la herramienta de cita: se sacan al abrir la
 * portada en el editor (y el render las usa mientras tanto), para que no se pierdan.
 */
export function separarCitas(contenido?: OutputData): { sinCitas: OutputData; citas: OutputBlockData[] } {
  const bloques = bloquesDe(contenido);
  return {
    sinCitas: { ...contenido, blocks: bloques.filter((bloque) => bloque?.type !== 'quote') },
    citas: bloques.filter((bloque) => bloque?.type === 'quote' && tieneTexto(bloque)),
  };
}

/**
 * Del HTML de Puck al de Editor.js: `<strong>` y `<em>` pasan a `<b>` e `<i>`, que son las
 * etiquetas que su barra reconoce; lo único que se conserva además es `<a>` y `<br>`. El
 * subrayado y la alineación no existen en Editor.js y se pierden.
 */
function enLineaDeEditorjs(html: string): string {
  return html
    .replace(/<(\/?)strong\b[^>]*>/gi, '<$1b>')
    .replace(/<(\/?)em\b[^>]*>/gi, '<$1i>')
    .replace(/<\/?(?!(?:b|i|a|br)\b)[a-z][^>]*>/gi, '')
    .trim();
}

/** Los bloques de primer nivel de un HTML de Puck (`<p>`, `<h1>`–`<h6>`, `<ul>`, `<ol>`). */
function partesDe(html: string): Array<{ etiqueta: string; interior: string }> {
  const partes = Array.from(html.matchAll(/<(p|h[1-6]|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi), (parte) => ({
    etiqueta: parte[1].toLowerCase(),
    interior: parte[2],
  }));
  // Un texto sin envoltura es un párrafo.
  if (!partes.length && html.trim()) partes.push({ etiqueta: 'p', interior: html });
  return partes;
}

/**
 * Un HTML de Puck como bloques de Editor.js: párrafos y listas o, con `comoEncabezados`, un
 * encabezado por cada bloque (el titular).
 */
function bloquesDeHtml(html: string, comoEncabezados = false): OutputBlockData[] {
  const bloques: OutputBlockData[] = [];
  for (const { etiqueta, interior } of partesDe(html)) {
    if (comoEncabezados) {
      // Un salto de línea en un encabezado no sobrevive a Editor.js: se lee como un espacio.
      const text = enLineaDeEditorjs(interior).replace(/<br\s*\/?>/gi, ' ');
      if (textoPlano(text)) bloques.push({ type: 'header', data: { text, level: 2 } });
    } else if (etiqueta === 'ul' || etiqueta === 'ol') {
      const items = Array.from(interior.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi), (item) =>
        enLineaDeEditorjs(item[1])
      )
        .filter((contenido) => textoPlano(contenido))
        .map((content) => ({ content, meta: {}, items: [] }));
      if (items.length) {
        bloques.push({ type: 'list', data: { style: etiqueta === 'ol' ? 'ordered' : 'unordered', meta: {}, items } });
      }
    } else {
      const text = enLineaDeEditorjs(interior);
      if (textoPlano(text)) bloques.push({ type: 'paragraph', data: { text } });
    }
  }
  return bloques;
}

/**
 * El titular y la descripción guardados como HTML, pasados a `contenido`: el titular, en
 * encabezados; la descripción, en párrafos y listas. Lo que falta o está vacío se completa con
 * el texto del diseño, como lo pintaba la portada.
 */
export function contenidoDesdeHtml(guardados: Pick<TextosEnHtml, 'tituloSeccion' | 'descripcion'>): OutputData {
  return {
    blocks: [
      ...bloquesDeHtml(guardados.tituloSeccion || TEXTOS_EN_HTML_POR_DEFECTO.tituloSeccion, true),
      ...bloquesDeHtml(guardados.descripcion || TEXTOS_EN_HTML_POR_DEFECTO.descripcion),
    ],
  };
}

/** El texto del recuadro guardado como HTML, pasado a `textoBloque`; vacío, el del diseño. */
export function textoBloqueDesdeHtml(titulo?: string): OutputData {
  return { blocks: bloquesDeHtml(titulo || TEXTOS_EN_HTML_POR_DEFECTO.titulo) };
}

/** Lo que trae el bloque recién puesto en la página. */
export const CONTENIDO_DEL_BUSCADOR_POR_DEFECTO: OutputData = contenidoDesdeHtml(TEXTOS_EN_HTML_POR_DEFECTO);
export const TEXTO_BLOQUE_POR_DEFECTO: OutputData = textoBloqueDesdeHtml();
