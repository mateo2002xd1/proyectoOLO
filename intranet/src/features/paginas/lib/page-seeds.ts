/**
 * Semillas por slug para la Intranet.
 *
 * Una "semilla" es el contenido estático con el que se PRE-LLENA el editor
 * cuando una página aún no tiene versión en BD. Así, al abrir "editar" por
 * primera vez, el administrador arranca desde una copia editable en vez de un
 * lienzo en blanco. Al primer "Guardar Borrador" se crea la versión real y la
 * semilla deja de usarse.
 *
 * NOTA sobre el inicio: la home real (`features/inicio/ui/InicioView`) incluye
 * secciones bespoke (carruseles, publicaciones, render de PDFs) que todavía NO
 * son bloques Puck. La semilla trae el "chrome" editable disponible en el
 * catálogo (Topbar + Hero + Footer). Convertir esas secciones ricas en bloques
 * editables es trabajo aparte.
 *
 * IMPORTANTE: cada semilla usa EXACTAMENTE los `type` registrados en
 * `puck.config.tsx`; sus props replican los `defaultProps` de cada bloque.
 */
import type { ContenidoPagina } from '../types/editor.types';

const EMPTY_CONTENIDO: ContenidoPagina = { content: [], root: {} };

export const pageSeeds: Record<string, ContenidoPagina> = {
  inicio: {
    content: [
      {
        type: 'IntranetTopbar',
        props: {
          id: 'seed-intranet-topbar',
          brandText: 'Intranet',
          logoUrl: '/assets/svg/olo-logo-blanco.svg',
          menuItems: [
            { href: '/intranet', label: 'Inicio' },
            { href: '#', label: 'Tasa de Vinculación y Empleabilidad' },
            { href: '#', label: 'Matriz de Pertinencia' },
            { href: '#', label: 'Encuestas' },
          ],
        },
      },
      {
        type: 'IntranetHero',
        props: {
          id: 'seed-intranet-hero',
          imageSrc: '/assets/img/banner1.png',
          imageAlt: 'Banner principal de la intranet',
        },
      },
      {
        type: 'IntranetFooter',
        props: { id: 'seed-intranet-footer' },
      },
    ],
    root: {},
  },
};

/** Devuelve la semilla del slug, o contenido vacío si no hay semilla definida. */
export function getPageSeed(slug: string): ContenidoPagina {
  return pageSeeds[slug] ?? EMPTY_CONTENIDO;
}

/** True si el contenido editable llega "vacío" (sin bloques o sin versión). */
export function isEmptyContent(contenido: unknown): boolean {
  if (!contenido) return true;
  if (Array.isArray(contenido)) return contenido.length === 0;
  const data = contenido as { content?: unknown[] };
  return !Array.isArray(data.content) || data.content.length === 0;
}
