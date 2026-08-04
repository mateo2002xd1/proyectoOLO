/**
 * La plantilla de la intranet: la barra de navegación y el pie que rodean a todas
 * las secciones.
 *
 * Antes cada sección guardaba su PROPIA copia de esos dos bloques dentro de su
 * contenido, así que había cinco menús y cinco pies distintos aunque se vieran
 * iguales. Al editarlos desde una sección solo cambiaba esa, y con el tiempo
 * divergieron: el desplegable de «Encuestas» solo sobrevivió en `/tasa`, porque
 * `sembrar-pagina-tasa.ts` sembraba el bloque sin props (y caían los valores por
 * defecto, que sí lo traen) mientras que `sembrar-paginas-intranet.ts` los
 * sobrescribía con un menú plano.
 *
 * Ahora existe una sola página, `plantilla`, que los guarda una vez, y
 * `app/(secciones)/layout.tsx` los pinta alrededor de todas las secciones.
 * Se edita como cualquier otra página —en `/editor/plantilla`, con su borrador,
 * su revisión y su aprobación—, y lo que se guarde ahí se ve en las cinco.
 */
import type { ComponentProps } from 'react';
import type { IntranetTopbar } from '@/shared/lib/blocks/IntranetTopbar';
import type { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';
import { obtenerPaginaPublicada } from '../api/paginas.api';

/** Slug de la página que guarda la barra y el pie comunes. */
export const SLUG_PLANTILLA = 'plantilla';

/** `onLogout` e `isLoading` los inyecta `IntranetTopbarWrapper`, no se guardan. */
type PropsTopbar = Omit<ComponentProps<typeof IntranetTopbar>, 'onLogout' | 'isLoading'>;

type PropsPie = ComponentProps<typeof IntranetFooter>;

export interface Plantilla {
  /** Props guardadas de la barra. `null` si la plantilla no lleva barra. */
  topbar: PropsTopbar | null;
  /** Props guardadas del pie. `null` si la plantilla no lleva pie. */
  pie: PropsPie | null;
}

/**
 * Lo que se pinta cuando no hay plantilla publicada (o la API no responde).
 *
 * `topbar: {}` y `pie: {}` no son "una barra vacía" ni "un pie vacío": son la
 * barra y el pie con los valores por defecto de los propios componentes, que son
 * exactamente los que hoy se ven en `/tasa`.
 */
const PLANTILLA_POR_DEFECTO: Plantilla = { topbar: {}, pie: {} };

/**
 * Las props guardadas de un bloque, listas para pasárselas al componente.
 *
 * Quita `id`, que lo inyecta Puck para identificar el bloque dentro del lienzo y
 * los componentes no esperan, y los campos que estén a `null`. Esto último
 * importa porque los valores por defecto viven en la firma del componente y solo
 * saltan con `undefined`: un `columnas: null` guardado en la base llegaría tal
 * cual y reventaría el `.map` en vez de caer en el pie por defecto.
 */
function propsDelBloque(props: Record<string, unknown>): Record<string, unknown> {
  const { id: _id, ...resto } = props;
  return Object.fromEntries(Object.entries(resto).filter(([, valor]) => valor != null));
}

/**
 * Lee la plantilla publicada.
 *
 * Nunca lanza. Esto envuelve TODAS las secciones de la intranet: si la API está
 * caída, la página debe seguir teniendo menú y pie en vez de quedarse sin
 * navegación o, peor, romper el árbol entero desde el layout.
 */
export async function obtenerPlantilla(): Promise<Plantilla> {
  let pagina;
  try {
    pagina = await obtenerPaginaPublicada(SLUG_PLANTILLA);
  } catch {
    return PLANTILLA_POR_DEFECTO;
  }

  if (!pagina) return PLANTILLA_POR_DEFECTO;

  const bloques = pagina.contenido?.content ?? [];
  const bloqueTopbar = bloques.find((bloque) => bloque.type === 'IntranetTopbar');
  const bloquePie = bloques.find((bloque) => bloque.type === 'IntranetFooter');

  // Quitar la barra o el pie desde el editor es una decisión legítima y se
  // respeta: si el bloque no está, no se pinta. Solo la ausencia de plantilla
  // entera vuelve a los valores por defecto.
  return {
    topbar: bloqueTopbar ? (propsDelBloque(bloqueTopbar.props) as PropsTopbar) : null,
    pie: bloquePie ? (propsDelBloque(bloquePie.props) as PropsPie) : null,
  };
}
