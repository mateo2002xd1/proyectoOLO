import React from 'react';
import { Header, Hero, ExternalPortals, Footer } from '@olo/blocks-renderer';
import type { Bloque } from '../types';

/**
 * @deprecated Este componente ha sido reemplazado por `<Render>` de `@puckeditor/core`.
 * Se mantiene temporalmente por si quedan consumidores legacy.
 * Use `<Render config={puckConfig} data={pagina.contenido} />` en su lugar.
 */

/* Registro heterogéneo: cada bloque espera su propio tipo de `block`
   (HeaderBlock, HeroBlock, …), y un ComponentType común no puede representarlos
   sin romper la contravarianza de props. Como este componente está deprecado y
   se eliminará, se acepta `any` aquí en lugar de forzar una unión artificial. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // `props` viene del CMS sin forma garantizada: normalizamos el id a string.
        const id = typeof bloque.props?.id === 'string' ? bloque.props.id : `block-${i}`;
        return <BlockComponent key={id} block={{ id, ...bloque }} />;
      })}
    </div>
  );
}
