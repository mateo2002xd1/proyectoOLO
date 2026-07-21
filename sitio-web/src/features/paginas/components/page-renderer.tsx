import React from 'react';
import { Header, Hero, ExternalPortals, Footer } from '@olo/blocks-renderer';
import type { Bloque } from '../types';

/**
 * @deprecated Este componente ha sido reemplazado por `<Render>` de `@puckeditor/core`.
 * Se mantiene temporalmente por si quedan consumidores legacy.
 * Use `<Render config={puckConfig} data={pagina.contenido} />` en su lugar.
 */

const blockComponents: Record<string, React.ComponentType<any>> = {
  Header,
  Hero,
  'external-portals': ExternalPortals,
  Footer,
};

interface PageRendererProps {
  slug: string;
  blocks: Bloque[];
}

export function PageRenderer({ slug, blocks }: PageRendererProps) {
  return (
    <div data-page-renderer={slug}>
      {blocks.map((bloque, i) => {
        const BlockComponent = blockComponents[bloque.type];
        if (!BlockComponent) return null;
        return (
          <BlockComponent
            key={bloque.props?.id || `block-${i}`}
            block={{ id: bloque.props?.id || `block-${i}`, ...bloque }}
          />
        );
      })}
    </div>
  );
}
