/**
 * Campos obligatorios de accesibilidad para bloques Puck (sitio-web + intranet).
 *
 * ## Por qué existe
 *
 * `9-accesibilidad.md` Fase 5 pide que ningún bloque se pueda publicar sin texto
 * alternativo en sus imágenes ni título en sus iframes (SC 1.1.1 / SC 4.1.2): un
 * lector de pantalla anuncia una imagen sin `alt` con solo el nombre del archivo, y
 * un iframe sin `title` como "marco" a secas. Puck no tiene ningún concepto nativo
 * de campo obligatorio (no hay `required` en su API de fields), así que la regla se
 * construye a mano aquí.
 *
 * ## Por qué es un paquete y no vive en cada app
 *
 * La regla se aplica dos veces — un aviso inmediato en el editor (cliente) y el
 * rechazo real al enviar a revisión (`api-backend`) — y las dos tienen que decidir
 * exactamente lo mismo, o un campo que el editor cree que completó vuelve rechazado
 * sin explicación, o peor, uno que el editor cree obligatorio en realidad no se
 * valida en el servidor y se publica igual. Mismo patrón que `password-policy`:
 * una sola fuente de verdad, importada por las tres apps.
 *
 * **Si agregás un campo de imagen o de iframe nuevo a un bloque, sumalo al
 * manifiesto de su ámbito aquí.** Nada más lo hace automáticamente — es una lista
 * a mano, como el checklist de `9-accesibilidad.md §5`.
 */

export type Ambito = 'sitio' | 'intranet';

export interface ViolacionAccesibilidad {
  /** Tipo de bloque Puck, ej. "TasaBanner". */
  bloque: string;
  /** Etiqueta legible del bloque para mostrar al editor. */
  bloqueEtiqueta: string;
  /** Nombre del campo que falta, con la ruta dentro de un array si aplica (ej. "logos[2].alt"). */
  campo: string;
  motivo: 'alt_faltante' | 'titulo_faltante';
}

interface ReglaAlt {
  tipo: 'alt';
  campoImagen: string;
  campoAlt: string;
}

interface ReglaAltEnArray {
  tipo: 'alt-array';
  campoArray: string;
  campoImagen: string;
  campoAlt: string;
}

interface ReglaTitulo {
  tipo: 'titulo';
  campoTitulo: string;
}

interface ReglaTituloEnArray {
  tipo: 'titulo-array';
  campoArray: string;
  campoTitulo: string;
}

type Regla = ReglaAlt | ReglaAltEnArray | ReglaTitulo | ReglaTituloEnArray;

interface DefinicionBloque {
  etiqueta: string;
  reglas: Regla[];
}

type Manifiesto = Record<string, DefinicionBloque>;

/**
 * sitio-web.
 *
 * `Header.mainLogoUrl`/`govBannerImageUrl` e `IntranetTopbar.logoUrl` quedan
 * fuera a propósito: hoy no tienen ningún campo de alt editable en Puck (el
 * texto alternativo está fijo en el componente), así que no hay nada que
 * validar todavía. Agregarles un campo de alt editable es una mejora aparte.
 *
 * `Hero` (Buscador de Ocupaciones) tampoco está: desde el rediseño del 18-10-2026 su
 * única imagen es el fondo de la sección, decorativo y pintado como fondo CSS. El logo
 * que pedía alt (`imageUrl`/`imageAlt`) ya no se pinta.
 */
const MANIFIESTO_SITIO: Manifiesto = {
  IntranetHero: {
    etiqueta: 'Banner Principal',
    reglas: [{ tipo: 'alt', campoImagen: 'imageSrc', campoAlt: 'imageAlt' }],
  },
  DatoOloSemana: {
    etiqueta: 'Dato OLO de la semana',
    reglas: [{ tipo: 'alt', campoImagen: 'imagenSrc', campoAlt: 'imagenAlt' }],
  },
  RecursosVisualesBloque: {
    etiqueta: 'Recursos Visuales',
    reglas: [{ tipo: 'titulo-array', campoArray: 'videos', campoTitulo: 'titulo' }],
  },
  /* La portada del PDF se dibuja en un `<img>` cuyo `alt` es el título de la
     publicación, así que un PDF sin título queda además sin texto alternativo. */
  Publicaciones: {
    etiqueta: 'Últimas publicaciones',
    reglas: [{ tipo: 'alt-array', campoArray: 'publicaciones', campoImagen: 'pdfUrl', campoAlt: 'titulo' }],
  },
  /* Cada documento pinta un `<iframe title={titulo}>`: sin título el iframe
     queda mudo para un lector de pantalla. */
  VisorDocumentosNormativos: {
    etiqueta: 'Visor de documentos normativos',
    reglas: [{ tipo: 'titulo-array', campoArray: 'documentos', campoTitulo: 'titulo' }],
  },
};

const MANIFIESTO_INTRANET: Manifiesto = {
  IntranetHero: {
    etiqueta: 'Banner Principal',
    reglas: [{ tipo: 'alt', campoImagen: 'imageSrc', campoAlt: 'imageAlt' }],
  },
  TasaBanner: {
    etiqueta: 'Banner de Tasa',
    reglas: [{ tipo: 'alt', campoImagen: 'imagenSrc', campoAlt: 'imagenAlt' }],
  },
  MatrizBanner: {
    etiqueta: 'Banner de Matriz',
    reglas: [{ tipo: 'alt', campoImagen: 'imagenSrc', campoAlt: 'imagenAlt' }],
  },
  EncuestaBanner: {
    etiqueta: 'Banner de Encuesta',
    reglas: [{ tipo: 'alt', campoImagen: 'imagenSrc', campoAlt: 'imagenAlt' }],
  },
  TextoConImagen: {
    etiqueta: 'Texto con Imagen',
    reglas: [{ tipo: 'alt', campoImagen: 'imagenSrc', campoAlt: 'imagenAlt' }],
  },
  ImagenDestacada: {
    etiqueta: 'Imagen Destacada',
    reglas: [{ tipo: 'alt', campoImagen: 'imagenSrc', campoAlt: 'imagenAlt' }],
  },
  SeccionCarrusel: {
    etiqueta: 'Carrusel',
    reglas: [{ tipo: 'alt-array', campoArray: 'imagenes', campoImagen: 'src', campoAlt: 'alt' }],
  },
  TasaConceptos: {
    etiqueta: 'Conceptos',
    reglas: [{ tipo: 'alt-array', campoArray: 'conceptos', campoImagen: 'imagenSrc', campoAlt: 'imagenAlt' }],
  },
  PreguntasFrecuentes: {
    etiqueta: 'Preguntas Frecuentes',
    reglas: [{ tipo: 'alt-array', campoArray: 'tarjetas', campoImagen: 'imagenSrc', campoAlt: 'imagenAlt' }],
  },
  IntranetFooter: {
    etiqueta: 'Pie de página',
    reglas: [{ tipo: 'alt-array', campoArray: 'logos', campoImagen: 'src', campoAlt: 'alt' }],
  },
  TasaVideo: {
    etiqueta: 'Video',
    reglas: [{ tipo: 'titulo', campoTitulo: 'tituloDestacado' }],
  },
  TasaDashboards: {
    etiqueta: 'Tableros Power BI',
    reglas: [{ tipo: 'titulo-array', campoArray: 'tableros', campoTitulo: 'titulo' }],
  },
  RecursosVisualesBloque: {
    etiqueta: 'Recursos Visuales',
    reglas: [{ tipo: 'titulo-array', campoArray: 'videos', campoTitulo: 'titulo' }],
  },
  /* La portada del PDF se dibuja en un `<img>` cuyo `alt` es el título de la
     publicación, así que un PDF sin título queda además sin texto alternativo. */
  Publicaciones: {
    etiqueta: 'Últimas publicaciones',
    reglas: [{ tipo: 'alt-array', campoArray: 'publicaciones', campoImagen: 'pdfUrl', campoAlt: 'titulo' }],
  },
};

const MANIFIESTOS: Record<Ambito, Manifiesto> = {
  sitio: MANIFIESTO_SITIO,
  intranet: MANIFIESTO_INTRANET,
};

/** Forma mínima de un bloque Puck — la misma simplificación que ya usa `sanitizar-contenido.ts`. */
interface BloquePuck {
  type?: unknown;
  props?: Record<string, unknown>;
}

interface ContenidoPuck {
  content?: unknown;
}

const esNoVacio = (valor: unknown): boolean => typeof valor === 'string' && valor.trim().length > 0;

const items = (valor: unknown): Record<string, unknown>[] =>
  Array.isArray(valor) ? (valor.filter((v) => v && typeof v === 'object') as Record<string, unknown>[]) : [];

function revisarBloque(bloque: BloquePuck, manifiesto: Manifiesto): ViolacionAccesibilidad[] {
  if (typeof bloque.type !== 'string') return [];
  const definicion = manifiesto[bloque.type];
  if (!definicion) return [];

  const props = bloque.props ?? {};
  const violaciones: ViolacionAccesibilidad[] = [];

  for (const regla of definicion.reglas) {
    if (regla.tipo === 'alt') {
      if (esNoVacio(props[regla.campoImagen]) && !esNoVacio(props[regla.campoAlt])) {
        violaciones.push({
          bloque: bloque.type,
          bloqueEtiqueta: definicion.etiqueta,
          campo: regla.campoAlt,
          motivo: 'alt_faltante',
        });
      }
    } else if (regla.tipo === 'titulo') {
      if (!esNoVacio(props[regla.campoTitulo])) {
        violaciones.push({
          bloque: bloque.type,
          bloqueEtiqueta: definicion.etiqueta,
          campo: regla.campoTitulo,
          motivo: 'titulo_faltante',
        });
      }
    } else if (regla.tipo === 'alt-array') {
      items(props[regla.campoArray]).forEach((item, indice) => {
        if (esNoVacio(item[regla.campoImagen]) && !esNoVacio(item[regla.campoAlt])) {
          violaciones.push({
            bloque: bloque.type as string,
            bloqueEtiqueta: definicion.etiqueta,
            campo: `${regla.campoArray}[${indice}].${regla.campoAlt}`,
            motivo: 'alt_faltante',
          });
        }
      });
    } else if (regla.tipo === 'titulo-array') {
      items(props[regla.campoArray]).forEach((item, indice) => {
        if (!esNoVacio(item[regla.campoTitulo])) {
          violaciones.push({
            bloque: bloque.type as string,
            bloqueEtiqueta: definicion.etiqueta,
            campo: `${regla.campoArray}[${indice}].${regla.campoTitulo}`,
            motivo: 'titulo_faltante',
          });
        }
      });
    }
  }

  return violaciones;
}

/**
 * Recorre el contenido Puck de una página y devuelve qué campos obligatorios de
 * accesibilidad faltan. Lista vacía = contenido conforme, listo para enviar a
 * revisión.
 *
 * Un campo de alt solo es obligatorio **si su imagen ya está cargada** — un bloque
 * sin imagen todavía no tiene nada que describir. Un título de iframe siempre es
 * obligatorio si el bloque existe, porque el iframe se publica igual esté vacío o no.
 */
export function validarAccesibilidad(contenido: unknown, ambito: Ambito): ViolacionAccesibilidad[] {
  if (!contenido || typeof contenido !== 'object') return [];
  const data = contenido as ContenidoPuck;
  const manifiesto = MANIFIESTOS[ambito];

  return items(data.content).flatMap((bloque) => revisarBloque(bloque as BloquePuck, manifiesto));
}

/** Mensaje en lenguaje llano para mostrarle a un editor no técnico. */
export function mensajeDeViolacion(v: ViolacionAccesibilidad): string {
  if (v.motivo === 'alt_faltante') {
    return `Falta texto alternativo en la imagen del bloque "${v.bloqueEtiqueta}".`;
  }
  return `Falta título en el video/tablero del bloque "${v.bloqueEtiqueta}" (lo necesita un lector de pantalla).`;
}
