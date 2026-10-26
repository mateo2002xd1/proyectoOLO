import type { OutputBlockData, OutputData } from '@editorjs/editorjs';

/**
 * Los textos de la sección «¿Sabes qué es una ocupación?» de la portada, en un solo campo de
 * Editor.js. El campo no sabe de zonas: cada bloque va a una según su tipo.
 *
 *  - encabezado → el titular, arriba;
 *  - párrafo y lista → la descripción, bajo el titular;
 *  - cita → el texto del recuadro azul, sobre el buscador.
 *
 * Antes eran tres campos `richtext` de Puck (`tituloSeccion`, `descripcion` y `titulo`).
 * Una portada guardada así se pinta como siempre hasta que se abre en el editor, y entonces
 * `contenidoDesdeHtml` la pasa al campo nuevo.
 */
export interface TextosRepartidos {
  titular: OutputBlockData[];
  descripcion: OutputBlockData[];
  recuadro: OutputBlockData[];
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

function tieneTexto(bloque: OutputBlockData): boolean {
  if (bloque.type === 'list') return Array.isArray(bloque.data?.items) && bloque.data.items.length > 0;
  return textoPlano(bloque.data?.text) !== '';
}

/** Reparte los bloques del campo entre las tres zonas; los vacíos y los de otro tipo se descartan. */
export function repartirTextos(contenido?: OutputData): TextosRepartidos {
  const reparto: TextosRepartidos = { titular: [], descripcion: [], recuadro: [] };
  const bloques = contenido?.blocks;
  for (const bloque of Array.isArray(bloques) ? bloques : []) {
    if (!bloque || !tieneTexto(bloque)) continue;
    if (bloque.type === 'header') reparto.titular.push(bloque);
    else if (bloque.type === 'quote') reparto.recuadro.push(bloque);
    else if (bloque.type === 'paragraph' || bloque.type === 'list') reparto.descripcion.push(bloque);
  }
  return reparto;
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
 * Los tres textos guardados como HTML, pasados al campo único: el titular, en encabezados; la
 * descripción, en párrafos y listas; el recuadro, en una sola cita. Lo que falta o está vacío
 * se completa con el texto del diseño, como lo pintaba la portada.
 */
export function contenidoDesdeHtml(guardados: TextosEnHtml): OutputData {
  const textos = {
    tituloSeccion: guardados.tituloSeccion || TEXTOS_EN_HTML_POR_DEFECTO.tituloSeccion,
    descripcion: guardados.descripcion || TEXTOS_EN_HTML_POR_DEFECTO.descripcion,
    titulo: guardados.titulo || TEXTOS_EN_HTML_POR_DEFECTO.titulo,
  };
  const blocks: OutputBlockData[] = [];

  for (const { interior } of partesDe(textos.tituloSeccion)) {
    // Un salto de línea en un encabezado no sobrevive a Editor.js: se lee como un espacio.
    const text = enLineaDeEditorjs(interior).replace(/<br\s*\/?>/gi, ' ');
    if (textoPlano(text)) blocks.push({ type: 'header', data: { text, level: 2 } });
  }

  for (const { etiqueta, interior } of partesDe(textos.descripcion)) {
    if (etiqueta === 'ul' || etiqueta === 'ol') {
      const items = Array.from(interior.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi), (item) =>
        enLineaDeEditorjs(item[1])
      )
        .filter((contenido) => textoPlano(contenido))
        .map((content) => ({ content, meta: {}, items: [] }));
      if (items.length) blocks.push({ type: 'list', data: { style: etiqueta === 'ol' ? 'ordered' : 'unordered', meta: {}, items } });
    } else {
      const text = enLineaDeEditorjs(interior);
      if (textoPlano(text)) blocks.push({ type: 'paragraph', data: { text } });
    }
  }

  const recuadro = partesDe(textos.titulo)
    .map(({ interior }) => enLineaDeEditorjs(interior))
    .filter((texto) => textoPlano(texto))
    .join('<br>');
  if (recuadro) blocks.push({ type: 'quote', data: { text: recuadro, caption: '', alignment: 'left' } });

  return { blocks };
}

/** Lo que trae el bloque recién puesto en la página. */
export const CONTENIDO_DEL_BUSCADOR_POR_DEFECTO: OutputData = contenidoDesdeHtml(TEXTOS_EN_HTML_POR_DEFECTO);
