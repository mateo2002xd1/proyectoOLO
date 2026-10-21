/**
 * Semillas por slug para la Intranet.
 *
 * Una "semilla" es el contenido estático con el que se PRE-LLENA el editor
 * cuando una página aún no tiene versión en BD. Así, al abrir "editar" por
 * primera vez, el administrador arranca desde una copia editable en vez de un
 * lienzo en blanco. Al primer "Guardar Borrador" se crea la versión real y la
 * semilla deja de usarse.
 *
 * Ahora mismo no hay ninguna, y es lo correcto: las secciones que existen
 * (`inicio`, `tasa`, `matriz` y las dos encuestas) ya tienen su contenido en la
 * base, sembrado por `sembrar-pagina-tasa.ts` y `sembrar-paginas-intranet.ts`,
 * así que nunca llegan aquí. Antes había una semilla de `inicio` con tres
 * bloques (barra, banner y pie) que no se parecía en nada a la página real de
 * ocho secciones: abrir el editor con ella habría hecho creer que ese era el
 * contenido de inicio.
 *
 * El sitio de esto es una página NUEVA, creada desde el comodín `[...puckPath]`,
 * si algún día conviene que arranque con una plantilla en vez de en blanco.
 *
 * IMPORTANTE: cada semilla debe usar EXACTAMENTE los `type` registrados en
 * `puck.config.tsx`; sus props replican los `defaultProps` de cada bloque.
 */
import type { ContenidoPagina } from '../../model/pagina.types';

const EMPTY_CONTENIDO: ContenidoPagina = { content: [], root: {} };

export const pageSeeds: Record<string, ContenidoPagina> = {};

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
