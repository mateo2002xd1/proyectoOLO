/**
 * El menú y pie del sitio: la cabecera y el pie que rodean a todas las páginas.
 *
 * Hasta ahora los dos estaban escritos a mano en `app/(public)/layout.tsx`, así
 * que cambiar un enlace del menú era tocar código y desplegar. Ahora existe una
 * página, `menu-y-pie`, que los guarda como bloques de Puck y se edita como
 * cualquier otra —en `/edit/menu-y-pie`, con su borrador, su revisión y su
 * aprobación—: lo que se guarde ahí se ve en todo el sitio.
 *
 * En el código el concepto sigue llamándose «plantilla» (`obtenerPlantilla`,
 * `SLUG_PLANTILLA`): esos nombres los comparten la API y la intranet, y renombrarlos
 * se decidió dejarlo fuera (ver `6-auditoria.md`, 18-09-2026).
 *
 * Es el mismo modelo que la intranet (`intranet/src/features/gestor-secciones/
 * lib/plantilla.ts`), con una diferencia: la cabecera parte de unos valores por
 * defecto (`cabecera-por-defecto.ts`) y lo guardado solo pisa los campos que traiga.
 */
import type { ComponentProps } from 'react';
import type { Header } from '@/shared/lib/blocks/header';
import type { Footer } from '@/shared/lib/blocks/footer';
import { obtenerPaginaPublicadaCacheada } from '../publishing/services/publicacion.service';
import type { Bloque } from '../model/pagina.types';
import { CABECERA_POR_DEFECTO } from './cabecera-por-defecto';

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
  // La línea base de la cabecera, sobre la que se aplica lo que haya guardado.
  const base = CABECERA_POR_DEFECTO;

  const pagina = await obtenerPaginaPublicadaCacheada(SLUG_PLANTILLA);
  if (!pagina) return { cabecera: base, pie: {} as PropsPie };

  const contenido = pagina.contenido;
  const bloques: Bloque[] = Array.isArray(contenido) ? contenido : (contenido?.content ?? []);

  const bloqueCabecera = bloques.find((bloque) => bloque.type === 'Header');
  const bloquePie = bloques.find((bloque) => bloque.type === 'Footer');

  // Quitar la cabecera o el pie desde el editor es una decisión legítima y se
  // respeta: si el bloque no está, no se pinta. Solo la ausencia de la página
  // entera vuelve a la cabecera por defecto sola.
  return {
    cabecera: bloqueCabecera
      ? ({ ...base, ...propsDelBloque(bloqueCabecera.props) } as PropsCabecera)
      : null,
    pie: bloquePie ? (propsDelBloque(bloquePie.props) as PropsPie) : null,
  };
}
