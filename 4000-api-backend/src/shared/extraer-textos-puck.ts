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
 * Páginas del sitio web que no viven en `/{slug}` sino en una subcarpeta propia.
 * Copia de `RUTAS_PROPIAS` en `3000-sitio-web/src/features/paginas/model/rutas.ts`:
 * al mover una página allí, hay que añadirla también aquí o el buscador enlazará la
 * URL vieja (que igual redirige, pero con un salto de más).
 */
const RUTAS_PROPIAS_SITIO: Record<string, string> = {
  cno: '/clasificacion/cno',
  cuoc: '/clasificacion/cuoc',
};

/**
 * Resuelve la URL pública según el slug y el ámbito ('intranet' o 'sitio').
 * Los slugs jerárquicos de encuestas en intranet se mapean a su ruta correspondiente.
 */
export function resolverHref(slug: string, ambito: 'intranet' | 'sitio' = 'sitio'): string {
  if (ambito === 'intranet') {
    if (slug === 'encuestas-calidad-de-formacion') return '/encuestas/calidad-de-formacion';
    if (slug === 'encuestas-seguimiento-laboral') return '/encuestas/seguimiento-laboral';
    if (slug.startsWith('encuestas-')) return `/encuestas/${slug.replace(/^encuestas-/, '')}`;
  } else if (RUTAS_PROPIAS_SITIO[slug]) {
    return RUTAS_PROPIAS_SITIO[slug];
  }
  return `/${slug}`;
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
    const key = `${type}:${text.toLowerCase()}`;
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

      // Descripciones y párrafos
      if (obj.contenido && typeof obj.contenido === 'string') agregar('p', obj.contenido, blockId);
      if (obj.descripcion && typeof obj.descripcion === 'string') agregar('p', obj.descripcion, blockId);
      if (obj.description && typeof obj.description === 'string') agregar('p', obj.description, blockId);
      if (obj.texto && typeof obj.texto === 'string') agregar('p', obj.texto, blockId);
      if (obj.text && typeof obj.text === 'string') agregar('p', obj.text, blockId);
      if (obj.pieDeImagen && typeof obj.pieDeImagen === 'string') agregar('span', obj.pieDeImagen, blockId);
      if (obj.etiqueta && typeof obj.etiqueta === 'string') agregar('span', obj.etiqueta, blockId);
      if (obj.label && typeof obj.label === 'string') agregar('span', obj.label, blockId);

      // Recorrer propiedades internas (props, arrays anidados, etc.)
      for (const key of Object.keys(obj)) {
        if (
          [
            'titulo',
            'title',
            'sectionTitle',
            'tituloInicio',
            'tituloDestacado',
            'contenido',
            'descripcion',
            'description',
            'texto',
            'text',
          ].includes(key)
        ) {
          continue;
        }
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
