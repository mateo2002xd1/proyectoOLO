/**
 * Extractor de textos legibles a partir del árbol JSON de Puck.
 *
 * Recorre recursivamente los bloques de contenido de una página para extraer:
 * - Títulos principales y subtítulos (h1, h2)
 * - Párrafos y descripciones de texto enriquecido (p)
 * - Viñetas o etiquetas de elementos anidados (span)
 *
 * Limpia etiquetas HTML (como <p>, <strong>, <em>, <ol>, <li>) y marcas markdown (**)
 * para que el texto sea completamente limpio para el buscador.
 */

export interface ItemTextoPuck {
  type: 'h1' | 'h2' | 'p' | 'span';
  text: string;
  blockId?: string;
}

export interface PaginaIndiceBusqueda {
  href: string;
  slug: string;
  titulo: string;
  fechaActualizacion?: string;
  items: ItemTextoPuck[];
}

/** Limpia etiquetas HTML y normaliza espacios en blanco. */
export function limpiarTextoHtml(valor: unknown): string {
  if (typeof valor !== 'string') return '';
  return valor
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Las carpetas de cada app: un slug `{carpeta}-{resto}` vive en `/{carpeta}/{resto}`.
 *
 * Copia de `CARPETAS` en `features/editor/model/rutas.ts` de cada app: las dos resuelven
 * cualquier URL con un comodín `[...puckPath]` que une los segmentos con guion, y esta es
 * la vuelta. Si el buscador no la conociera, enlazaría `/clasificacion-cno`, que el sitio
 * igual redirige, pero con un salto de más.
 */
const CARPETAS: Record<'intranet' | 'sitio', string[]> = {
  intranet: ['encuestas'],
  sitio: ['clasificacion'],
};

/** Resuelve la URL pública de un slug en su ámbito ('intranet' o 'sitio'). */
export function resolverHref(slug: string, ambito: 'intranet' | 'sitio' = 'sitio'): string {
  const carpeta = CARPETAS[ambito].find((c) => slug.startsWith(`${c}-`));
  return carpeta ? `/${carpeta}/${slug.slice(carpeta.length + 1)}` : `/${slug}`;
}

/**
 * Extrae todos los fragmentos textuales relevantes de un objeto de contenido Puck.
 */
export function extraerTextosPuck(contenido: any, tituloPagina?: string): ItemTextoPuck[] {
  const items: ItemTextoPuck[] = [];
  const textosVistos = new Set<string>();

  const agregar = (type: 'h1' | 'h2' | 'p' | 'span', rawText: unknown, blockId?: string) => {
    const text = limpiarTextoHtml(rawText);
    if (!text || text.length < 2) return;
    // Incluir blockId en la clave: el mismo texto en bloques distintos (ej. dos pestañas)
    // debe aparecer como dos resultados separados en el buscador.
    const key = `${type}:${text.toLowerCase()}:${blockId ?? ''}`;
    if (textosVistos.has(key)) return;
    textosVistos.add(key);
    items.push({ type, text, ...(blockId ? { blockId } : {}) });
  };

  // 1. Siempre incluir el título de la página como h1 inicial
  if (tituloPagina) {
    agregar('h1', tituloPagina);
  }

  if (!contenido) return items;

  // Normalizar array de bloques principales
  const bloques: any[] = Array.isArray(contenido)
    ? [...contenido]
    : Array.isArray(contenido.content)
      ? [...contenido.content]
      : [];

  // Incluir bloques anidados en zonas/slots de Puck (por ejemplo, bloques dentro de pestañas)
  if (contenido?.zones && typeof contenido.zones === 'object') {
    for (const zoneList of Object.values(contenido.zones)) {
      if (Array.isArray(zoneList)) {
        bloques.push(...zoneList);
      }
    }
  }

  for (const bloque of bloques) {
    const props = bloque?.props || bloque;
    const blockId = props?.id || bloque?.id || undefined;

    const recorrerObjeto = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      if (Array.isArray(obj)) {
        obj.forEach(recorrerObjeto);
        return;
      }

      // ── EditorJS: { blocks: [{ type, data: { text, items, content } }] } ──────
      // El bloque `RichText` guarda su contenido en este formato.
      if (Array.isArray(obj.blocks)) {
        for (const block of obj.blocks) {
          if (!block?.data) continue;
          const d = block.data;
          // Párrafos, encabezados, citas
          if (d.text && typeof d.text === 'string') agregar('p', d.text, blockId);
          // Listas: items es un array de strings o de { content: string }
          if (Array.isArray(d.items)) {
            for (const item of d.items) {
              if (typeof item === 'string') agregar('span', item, blockId);
              else if (item?.content && typeof item.content === 'string') agregar('span', item.content, blockId);
            }
          }
        }
        return; // No seguir recursando dentro del árbol de EditorJS
      }

      // Títulos compuestos (ej. TasaBanner, TasaVideo)
      if (obj.tituloInicio || obj.tituloDestacado) {
        const compuesto = [obj.tituloInicio, obj.tituloDestacado].filter(Boolean).join(' ');
        agregar('h2', compuesto, blockId);
      }

      // Títulos estándar
      if (obj.titulo) agregar('h2', obj.titulo, blockId);
      if (obj.title) agregar('h2', obj.title, blockId);
      if (obj.sectionTitle) agregar('h2', obj.sectionTitle, blockId);
      if (obj.antetitulo) agregar('span', obj.antetitulo, blockId);
      if (obj.subtitulo) agregar('span', obj.subtitulo, blockId);

      // Párrafos e introducciones (richtext guardado como string HTML o texto plano)
      if (obj.contenido && typeof obj.contenido === 'string') agregar('p', obj.contenido, blockId);
      if (obj.descripcion && typeof obj.descripcion === 'string') agregar('p', obj.descripcion, blockId);
      if (obj.description && typeof obj.description === 'string') agregar('p', obj.description, blockId);
      if (obj.texto && typeof obj.texto === 'string') agregar('p', obj.texto, blockId);
      if (obj.text && typeof obj.text === 'string') agregar('p', obj.text, blockId);
      // `intro` es el campo de párrafo introductorio en PoliticaPrivacidadEncabezado y similares
      if (obj.intro && typeof obj.intro === 'string') agregar('p', obj.intro, blockId);

      // Metadatos y etiquetas cortas (canal, valor, nombre, etc.)
      if (obj.pieDeImagen && typeof obj.pieDeImagen === 'string') agregar('span', obj.pieDeImagen, blockId);
      if (obj.etiqueta && typeof obj.etiqueta === 'string') agregar('span', obj.etiqueta, blockId);
      if (obj.label && typeof obj.label === 'string') agregar('span', obj.label, blockId);
      if (obj.canal && typeof obj.canal === 'string') agregar('span', obj.canal, blockId);
      if (obj.valor && typeof obj.valor === 'string') agregar('span', obj.valor, blockId);
      if (obj.nombre && typeof obj.nombre === 'string') agregar('span', obj.nombre, blockId);
      if (obj.nombreEntidad && typeof obj.nombreEntidad === 'string') agregar('span', obj.nombreEntidad, blockId);
      if (obj.textoBoton && typeof obj.textoBoton === 'string') agregar('span', obj.textoBoton, blockId);
      if (obj.horarioTitulo && typeof obj.horarioTitulo === 'string') agregar('span', obj.horarioTitulo, blockId);
      if (obj.lineasAtencionTitulo && typeof obj.lineasAtencionTitulo === 'string') agregar('span', obj.lineasAtencionTitulo, blockId);
      if (obj.mesaAyudaTitulo && typeof obj.mesaAyudaTitulo === 'string') agregar('span', obj.mesaAyudaTitulo, blockId);
      if (obj.etiquetaTab && typeof obj.etiquetaTab === 'string') agregar('span', obj.etiquetaTab, blockId);

      // Recorrer propiedades internas (props, arrays anidados, etc.)
      // Se excluyen las claves ya procesadas arriba para no duplicar entradas.
      const CLAVES_YA_PROCESADAS = new Set([
        'titulo', 'title', 'sectionTitle', 'tituloInicio', 'tituloDestacado',
        'antetitulo', 'subtitulo',
        'contenido', 'descripcion', 'description', 'texto', 'text', 'intro',
        'pieDeImagen', 'etiqueta', 'label', 'canal', 'valor', 'nombre',
        'nombreEntidad', 'textoBoton', 'horarioTitulo', 'lineasAtencionTitulo', 'mesaAyudaTitulo', 'etiquetaTab'
      ]);
      for (const key of Object.keys(obj)) {
        if (CLAVES_YA_PROCESADAS.has(key)) continue;
        const val = obj[key];
        if (val && typeof val === 'object') {
          recorrerObjeto(val);
        }
      }
    };

    recorrerObjeto(props);

  }

  return items;
}
