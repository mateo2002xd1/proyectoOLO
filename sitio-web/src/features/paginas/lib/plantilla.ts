/**
 * La plantilla del sitio: la cabecera y el pie que rodean a todas las páginas.
 *
 * Hasta ahora los dos estaban escritos a mano en `app/(public)/layout.tsx`, así
 * que cambiar un enlace del menú era tocar código y desplegar. Ahora existe una
 * página, `plantilla`, que los guarda como bloques de Puck y se edita como
 * cualquier otra —en `/admin/editor/menu-y-pie`, con su borrador, su revisión y su
 * aprobación—: lo que se guarde ahí se ve en todo el sitio.
 *
 * Es el mismo modelo que la intranet (`intranet/src/features/gestor-secciones/
 * lib/plantilla.ts`), con una diferencia: aquí ya existía `identidad-visual`
 * (RF-03) alimentando la cabecera desde su propio endpoint, y sigue haciéndolo
 * como valores por defecto. La plantilla solo pisa los campos que traiga.
 */
import type { ComponentProps } from 'react';
import type { Header } from '@/shared/lib/blocks/Header';
import type { Footer } from '@/shared/lib/blocks/Footer';
import { obtenerIdentidadVisual } from '@/features/identidad-visual';
import { obtenerPaginaPublicadaCacheada } from '../services/paginas.service';
import type { Bloque } from '../types';

/** Slug de la página que guarda la cabecera y el pie comunes. */
export const SLUG_PLANTILLA = 'menu-y-pie';

/** `block` lo inyecta el layout para identificar el nodo, no se guarda. */
export type PropsCabecera = Omit<ComponentProps<typeof Header>, 'block'>;
export type PropsPie = Omit<ComponentProps<typeof Footer>, 'block'>;

export interface Plantilla {
  /** Props de la cabecera. `null` si la plantilla no lleva cabecera. */
  cabecera: PropsCabecera | null;
  /** Props del pie de página. `null` si la plantilla no lleva pie. */
  pie: PropsPie | null;
}

/**
 * Las props guardadas de un bloque, listas para pasárselas al componente.
 *
 * Quita `id`, que lo inyecta Puck para identificar el bloque dentro del lienzo y
 * los componentes no esperan, y los campos que estén a `null`. Esto último
 * importa porque los valores por defecto viven en la firma del componente y solo
 * saltan con `undefined`: un `navLinks: null` guardado en la base llegaría tal
 * cual y reventaría el `.map` en vez de caer en el menú por defecto.
 */
function propsDelBloque(props: Record<string, unknown>): Record<string, unknown> {
  const { id: _id, ...resto } = props;
  return Object.fromEntries(Object.entries(resto).filter(([, valor]) => valor != null));
}

/**
 * Lee la plantilla publicada.
 *
 * Nunca lanza. Esto envuelve TODAS las páginas del sitio: si la API está caída,
 * la página debe seguir teniendo cabecera y pie en vez de quedarse sin navegación
 * o, peor, romper el árbol entero desde el layout.
 */
export async function obtenerPlantilla(): Promise<Plantilla> {
  // La identidad visual trae su propio try/catch y sus valores por defecto, así
  // que siempre devuelve algo usable. Es la línea base sobre la que se aplica lo
  // que haya guardado la plantilla.
  const identidad = await obtenerIdentidadVisual();

  const pagina = await obtenerPaginaPublicadaCacheada(SLUG_PLANTILLA);
  if (!pagina) return { cabecera: identidad, pie: {} as PropsPie };

  const contenido = pagina.contenido;
  const bloques: Bloque[] = Array.isArray(contenido) ? contenido : (contenido?.content ?? []);

  const bloqueCabecera = bloques.find((bloque) => bloque.type === 'Header');
  const bloquePie = bloques.find((bloque) => bloque.type === 'Footer');

  // Quitar la cabecera o el pie desde el editor es una decisión legítima y se
  // respeta: si el bloque no está, no se pinta. Solo la ausencia de plantilla
  // entera vuelve a la identidad visual sola.
  return {
    cabecera: bloqueCabecera
      ? ({ ...identidad, ...propsDelBloque(bloqueCabecera.props) } as PropsCabecera)
      : null,
    pie: bloquePie ? (propsDelBloque(bloquePie.props) as PropsPie) : null,
  };
}
