/**
 * Page Renderer — Renderiza una página a partir de su contenido JSON de bloques.
 *
 * TODO: Fase 3 — Importar y usar @olo/blocks-renderer
 *   - Recibe el array de bloques (Bloque[]) de la página
 *   - Itera cada bloque y delega al componente correspondiente de @olo/blocks-renderer
 *   - NO reimplementa renderizado de bloques localmente (Regla de oro §0.2)
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §0.2 (@olo/blocks-renderer es la única fuente de componentes de renderizado)
 */

// TODO: Fase 3 — import { BlockRenderer } from '@olo/blocks-renderer';
// TODO: Fase 3 — import type { Bloque } from '@olo/types';

interface PageRendererProps {
  // TODO: Fase 3 — bloques: Bloque[];
  slug: string;
}

export function PageRenderer({ slug }: PageRendererProps) {
  // TODO: Fase 3 — Renderizar bloques con @olo/blocks-renderer
  return (
    <div data-page-renderer={slug}>
      <p>Page renderer stub para: {slug}</p>
    </div>
  );
}
