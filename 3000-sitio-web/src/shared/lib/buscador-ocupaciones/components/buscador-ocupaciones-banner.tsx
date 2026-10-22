'use client';

import { Suspense, type ComponentProps, type ReactNode } from 'react';
import { OcupacionSearchBanner } from '@/shared/ui/molecules/ocupacion-search-banner';
import { useBuscarEnPagina } from '../hooks/use-buscar-en-pagina';
import { ConsultaOcupaciones } from './consulta-ocupaciones';

/** Todo lo visual lo decide el banner; aquí solo se añade la consulta. */
type BuscadorOcupacionesBannerProps = Omit<
  ComponentProps<typeof OcupacionSearchBanner>,
  'value' | 'onValueChange' | 'onSearch'
> & {
  /** Dentro del editor la búsqueda no navega. */
  esEdicion?: boolean;
  /** Lo que va entre el buscador y los resultados (el texto de ayuda). */
  children?: ReactNode;
};

/**
 * El banner de búsqueda con la consulta al catálogo ya conectada.
 *
 * Existe porque el banner suelto (`OcupacionSearchBanner`) es solo presentación:
 * sin `onSearch` su formulario no lleva a ninguna parte. Ese cableado vive aquí, en un
 * único sitio: cualquiera que coloque el banner obtiene la búsqueda completa, con la
 * consulta en la URL (`?buscar=…`) y los resultados y la ficha de cada ocupación debajo
 * (`ConsultaOcupaciones`). Si la página de resultados es otra, la consulta lleva a ella, esté
 * el bloque donde esté.
 */
export function BuscadorOcupacionesBanner({
  esEdicion = false,
  children,
  ...props
}: BuscadorOcupacionesBannerProps) {
  const { buscar } = useBuscarEnPagina(esEdicion);

  return (
    <>
      <OcupacionSearchBanner {...props} onSearch={buscar} />

      {children}

      <Suspense fallback={null}>
        <ConsultaOcupaciones />
      </Suspense>
    </>
  );
}
