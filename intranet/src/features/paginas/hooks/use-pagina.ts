/**
 * Hook para obtener datos de una página por su slug.
 *
 * TODO: Fase 3 — Implementar fetch real contra API :4000
 *   - GET /api/paginas/:slug
 *   - Devolver contenido tipado con @olo/types (Pagina)
 *   - Manejar estados: borrador, en_revision, publicado, rechazado
 *
 * @see 1-guia-del-proyecto.md §2 (Modelo de datos — paginas/paginas_versiones)
 */

// TODO: Fase 3 — import type { Pagina } from '@olo/types';

export function usePagina(slug: string) {
  // TODO: Fase 3 — Implementar fetch real
  return {
    pagina: null,
    isLoading: false,
    error: null,
    slug,
  };
}
