'use client';

import { Carousel } from '@/shared/ui/organisms/Carousel';
import { resaltar } from './resaltar';

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
  titulo?: string;
  imagenes?: { src?: string; alt?: string }[];
  imagenesPorPagina?: number;
  autoplay?: boolean;
  mostrarBotones?: boolean;
  disposicion?: 'columna' | 'lado-a-lado';
  fondo?: 'blanco' | 'gris';
}

export function SeccionCarrusel({
  titulo,
  imagenes = [],
  imagenesPorPagina = 3,
  autoplay = true,
  mostrarBotones = true,
  disposicion = 'columna',
  fondo = 'blanco',
}: SeccionCarruselProps) {
  // El carrusel divide por el número de imágenes, así que sin ninguna se rompe.
  if (imagenes.length === 0) return null;

  const fuentes = imagenes.map((imagen) => imagen.src ?? '').filter(Boolean);
  if (fuentes.length === 0) return null;

  const carrusel = (
    <Carousel
      images={fuentes}
      itemsPerPage={imagenesPorPagina}
      autoplay={autoplay}
      showButtons={mostrarBotones}
    />
  );

  if (disposicion === 'lado-a-lado') {
    return (
      <div className="matriz-section-datoOLO">
        <div className="matriz-content-container-datoolo">
          {titulo && <h2>{resaltar(titulo)}</h2>}
          <div className="w-full md:flex-1">{carrusel}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${fondo === 'gris' ? 'matriz-section-gray' : 'matriz-section-white'} px-4 md:px-8`}
    >
      <div className="matriz-content-container-wide max-w-[1200px] mx-auto text-center flex flex-col items-center">
        {titulo && (
          <h2 className="tasa-concept-title mb-6">
            {resaltar(titulo)}
          </h2>
        )}
        <div className="w-full px-2 md:px-6">{carrusel}</div>
      </div>
    </div>
  );
}
