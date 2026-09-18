'use client';

import type { ReactNode } from 'react';
import { Carousel } from '@/shared/ui/organisms/carousel';

/**
 * Un carrusel de imágenes con su título.
 *
 * Es el bloque que más se repite en la intranet: aparece dos veces en inicio
 * («OLOtecuenta» y «#datoOLO de la semana») y una en matriz, siempre con el
 * mismo componente `Carousel` y cambiando solo cuántas imágenes se ven a la vez
 * y si lleva flechas. Por eso es un bloque con campos y no tres bloques.
 *
 * `disposicion` distingue los dos montajes que existen hoy: «columna» pone el
 * título encima del carrusel, y «lado-a-lado» lo pone a la izquierda, que es
 * como está OLOtecuenta.
 */
export interface SeccionCarruselProps {
  titulo?: ReactNode;
  imagenes?: { src?: string; alt?: string }[];
  imagenesPorPagina?: number;
  autoplay?: boolean;
  mostrarBotones?: boolean;
  disposicion?: 'columna' | 'lado-a-lado';
  fondo?: 'blanco' | 'gris';
}

const IMAGENES_PREVIEW_DEFECTO = [
  { src: '/assets/img/Carrusel1.png', alt: 'Vista previa carrusel 1' },
  { src: '/assets/img/Carrusel2.png', alt: 'Vista previa carrusel 2' },
  { src: '/assets/img/Carrusel3.png', alt: 'Vista previa carrusel 3' },
];

export function SeccionCarrusel({
  titulo,
  imagenes = [],
  imagenesPorPagina = 3,
  autoplay = true,
  mostrarBotones = true,
  disposicion = 'columna',
  fondo = 'blanco',
}: SeccionCarruselProps) {
  // El alt viaja con la imagen: antes se descartaba aquí y el carrusel pintaba
  // siempre "Imagen del carrusel N", así que lo que el editor escribía en el
  // campo de texto alternativo nunca llegaba al HTML.
  const imagenesConAlt = (imagenes || [])
    .filter((imagen): imagen is { src: string; alt?: string } => Boolean(imagen && imagen.src && imagen.src.trim()))
    .map((imagen) => ({ src: imagen.src, alt: imagen.alt ?? '' }));

  const esVistaPrevia = imagenesConAlt.length === 0;
  const listaFinal = esVistaPrevia ? IMAGENES_PREVIEW_DEFECTO : imagenesConAlt;

  const carrusel = (
    <div className="w-full relative">
      {esVistaPrevia && (
        <div className="w-full text-center py-1.5 px-3 mb-3 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg flex items-center justify-center gap-2">
          <span>🖼️</span>
          <span>Vista previa del carrusel — Añade o edita imágenes desde el panel lateral</span>
        </div>
      )}
      <Carousel
        images={listaFinal}
        itemsPerPage={Math.min(imagenesPorPagina, listaFinal.length)}
        autoplay={autoplay}
        showButtons={mostrarBotones}
      />
    </div>
  );

  if (disposicion === 'lado-a-lado') {
    return (
      <div className="matriz-section-datoOLO">
        <div className="matriz-content-container-datoolo">
          {titulo ? <h2>{titulo}</h2> : esVistaPrevia ? <h2>Título del carrusel</h2> : null}
          <div className="w-full md:flex-1">{carrusel}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${fondo === 'gris' ? 'matriz-section-gray' : 'matriz-section-white'} px-6`}
    >
      <div className="max-w-[1200px] w-full mx-auto text-center flex flex-col items-center py-12">
        {titulo ? (
          <h2 className="tasa-concept-title mb-6">
            {titulo}
          </h2>
        ) : esVistaPrevia ? (
          <h2 className="tasa-concept-title mb-6 text-gray-400 dark:text-gray-500 italic">
            Título del carrusel
          </h2>
        ) : null}
        <div className="w-full px-2 md:px-6">{carrusel}</div>
      </div>
    </div>
  );
}

