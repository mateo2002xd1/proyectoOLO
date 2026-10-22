'use client';

import { Suspense, type ReactNode } from 'react';
import { useBuscadorActivo } from '@/shared/lib/rutas-del-menu';
import { useBuscarEnPagina } from '../hooks/use-buscar-en-pagina';
import { ConsultaOcupaciones } from './consulta-ocupaciones';
import { AZUL_PORTADA, PortadaBuscadorOcupaciones } from './portada-buscador-ocupaciones';

/*
 * Textos del diseño. Puck entrega un campo `richtext` vacío —o ausente, como en una
 * portada guardada antes de que existieran estos campos— como `null`, así que el
 * respaldo va en nodos: el HTML de `defaultProps` se vería con sus etiquetas.
 */
const TITULO_SECCION_POR_DEFECTO = (
  <>
    ¿Sabes qué es una
    <br />
    <strong>ocupación?</strong>
  </>
);
const DESCRIPCION_POR_DEFECTO =
  'Es un conjunto de cargos, empleos u oficios que incluyen categorías homogéneas de funciones, independientemente del lugar o tiempo donde se desarrollen.';
const TEXTO_RECUADRO_POR_DEFECTO = (
  <>
    <em>Explora las ocupaciones clave de los</em> <strong>sectores productivos en Colombia.</strong>
  </>
);

export interface HeroBuscadorOcupacionesProps {
  tituloSeccion?: ReactNode;
  descripcion?: ReactNode;
  /** Texto del recuadro sobre el buscador. Se llama `titulo` desde antes del rediseño. */
  titulo?: ReactNode;
  searchPlaceholder?: string;
  imagenFondo?: string;
  /** 0 (opaca) a 100 (invisible); vacío = 0. */
  transparenciaFondo?: number | '';
  /** Color del recuadro del buscador (antes, del banner azul). */
  colorFondo?: string;
  /** Dentro del editor la búsqueda no navega. */
  esEdicion?: boolean;
  className?: string;
}

/**
 * Banner buscador de ocupaciones de la portada y de las páginas públicas.
 *
 * Al buscar lleva a la página de resultados que se elige en «Menú y pie», con la consulta en la
 * URL (`?buscar=…`); ahí, el bloque «Buscador de Ocupaciones» pinta los resultados y la ficha de
 * cada ocupación (`ConsultaOcupaciones`). Sin esa página, o si ya se está en ella, los pinta
 * debajo de sí mismo. Con el buscador apagado no se pinta (ver `useBuscadorActivo`).
 */
export function HeroBuscadorOcupaciones({
  tituloSeccion,
  descripcion,
  titulo,
  searchPlaceholder,
  imagenFondo,
  transparenciaFondo,
  colorFondo,
  esEdicion = false,
  className = 'w-full',
}: HeroBuscadorOcupacionesProps) {
  const { buscar } = useBuscarEnPagina(esEdicion);
  // Apagado en el bloque «Buscador de Ocupaciones»: el sitio no lo pinta. El editor sí,
  // para poder quitarlo de la página (no conoce el interruptor: no tiene el menú).
  const activo = useBuscadorActivo();
  if (!activo && !esEdicion) return null;

  return (
    <div className={className}>
      <PortadaBuscadorOcupaciones
        tituloSeccion={tituloSeccion ?? TITULO_SECCION_POR_DEFECTO}
        descripcion={descripcion ?? DESCRIPCION_POR_DEFECTO}
        textoRecuadro={titulo ?? TEXTO_RECUADRO_POR_DEFECTO}
        placeholder={searchPlaceholder || 'Buscar ocupación, código o denominación'}
        imagenFondo={imagenFondo}
        transparenciaFondo={transparenciaFondo}
        colorRecuadro={colorFondo}
        onSearch={buscar}
      />

      {/* `useSearchParams` obliga a una frontera de Suspense en una página que se genera
          de antemano; sin consulta en la URL no pinta nada. */}
      <Suspense fallback={null}>
        <ConsultaOcupaciones colorAcento={colorFondo || AZUL_PORTADA} />
      </Suspense>
    </div>
  );
}
