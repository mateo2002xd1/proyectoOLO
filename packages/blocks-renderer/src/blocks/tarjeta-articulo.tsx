'use client';

import React, { type ReactNode } from 'react';

export type AlineacionTarjeta = 'izquierda' | 'centro' | 'derecha';

export interface TarjetaArticuloProps {
  id?: string;
  imagenSrc?: string;
  imagenAlt?: string;
  titulo?: ReactNode;
  descripcion?: ReactNode;
  enlace?: string;
  mostrarBoton?: boolean;
  textoBoton?: string;
  enlaceBoton?: string;
  abrirEnNuevaPestana?: boolean;
  ancho?: 'fijo' | 'completo';
  alineacion?: AlineacionTarjeta;
  className?: string;
}

const ALINEACION_CONTENEDOR: Record<AlineacionTarjeta, string> = {
  izquierda: 'justify-start',
  centro: 'justify-center',
  derecha: 'justify-end',
};

const ALINEACION_MARGEN: Record<AlineacionTarjeta, string> = {
  izquierda: 'mr-auto',
  centro: 'mx-auto',
  derecha: 'ml-auto',
};

const FALLBACK_SVG =
  'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23041E42%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%231A365D%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22600%22%20height%3D%22300%22%20fill%3D%22url(%23bg)%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22150%22%20r%3D%2250%22%20fill%3D%22%237DB828%22%20opacity%3D%220.2%22%2F%3E%3Cpath%20d%3D%22M280%20130h40a4%204%200%200%201%204%204v32a4%204%200%200%201-4%204h-40a4%204%200%200%201-4-4v-32a4%204%200%200%201%204-4zm4%208v4h32v-4h-32zm0%2010v4h24v-4h-24zm0%2010v4h32v-4h-32z%22%20fill%3D%22%237DB828%22%2F%3E%3C%2Fsvg%3E';

/**
 * Componente Tarjeta de Artículo / Blog.
 * 
 * Basado en la card con imagen, encabezado h5, descripción y botón de acción con flecha.
 * Compatible con utilidades de Tailwind CSS y tokens semánticos.
 */
export function TarjetaArticulo({
  imagenSrc = '',
  imagenAlt = 'Ilustración del artículo',
  titulo = 'Optimiza y agiliza tus procesos hoy mismo',
  descripcion = 'En el entorno digital actual, impulsando una colaboración fluida entre equipos de desarrollo y operaciones.',
  enlace = '#',
  mostrarBoton = true,
  textoBoton = 'Leer más',
  enlaceBoton = '#',
  abrirEnNuevaPestana = false,
  ancho = 'fijo',
  alineacion = 'izquierda',
  className = '',
}: TarjetaArticuloProps) {
  const [srcEfectiva, setSrcEfectiva] = React.useState<string>(imagenSrc || FALLBACK_SVG);

  React.useEffect(() => {
    setSrcEfectiva(imagenSrc || FALLBACK_SVG);
  }, [imagenSrc]);

  const urlEnlace = enlace?.trim();
  const urlBoton = (enlaceBoton && enlaceBoton.trim()) || urlEnlace;
  const anchoClase = ancho === 'completo' ? 'w-full' : 'max-w-sm w-full';
  const claseAlineacionContenedor = ALINEACION_CONTENEDOR[alineacion] || ALINEACION_CONTENEDOR.izquierda;
  const claseAlineacionMargen = ALINEACION_MARGEN[alineacion] || ALINEACION_MARGEN.izquierda;

  const propsTarget = abrirEnNuevaPestana
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  const handleLinkClick = (url?: string) => (e: React.MouseEvent) => {
    if (!url || url === '#' || url === '') {
      e.preventDefault();
    }
  };

  return (
    <div className={`w-full flex ${claseAlineacionContenedor}`}>
      <div
        className={`olo-tarjeta-articulo bg-neutral-primary-soft bg-white dark:bg-neutral-800/95 block ${anchoClase} ${claseAlineacionMargen} p-6 border border-default border-neutral-200 dark:border-neutral-700 rounded-base rounded-xl shadow-xs transition-shadow hover:shadow-md ${className}`.trim()}
        style={{
          maxWidth: ancho === 'completo' ? '100%' : '384px',
          boxSizing: 'border-box',
        }}
      >
      {srcEfectiva && (
        <a
          href={urlEnlace || '#'}
          onClick={handleLinkClick(urlEnlace)}
          {...propsTarget}
          className="block mb-4 overflow-hidden rounded-base rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="olo-tarjeta-articulo-img rounded-base rounded-lg w-full h-48 object-cover transition-transform duration-200 hover:scale-[1.02]"
            src={srcEfectiva}
            alt={imagenAlt || 'Ilustración del artículo'}
            style={{ width: '100%', height: '192px', objectFit: 'cover' }}
            onError={() => {
              setSrcEfectiva(FALLBACK_SVG);
            }}
            onLoad={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('resize'));
              }
            }}
          />
        </a>
      )}

      {titulo && (
        urlEnlace && urlEnlace !== '#' ? (
          <a
            href={urlEnlace}
            onClick={handleLinkClick(urlEnlace)}
            {...propsTarget}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded"
          >
            <h5 className="olo-tarjeta-articulo-titulo mt-2 mb-2 text-2xl font-semibold tracking-tight text-heading text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
              {titulo}
            </h5>
          </a>
        ) : (
          <h5 className="olo-tarjeta-articulo-titulo mt-2 mb-2 text-2xl font-semibold tracking-tight text-heading text-neutral-900 dark:text-neutral-100 transition-colors">
            {titulo}
          </h5>
        )
      )}

      {descripcion && (
        <p className="olo-tarjeta-articulo-desc mb-6 text-body text-neutral-600 dark:text-neutral-300 text-sm sm:text-base leading-relaxed">
          {descripcion}
        </p>
      )}

      {mostrarBoton && (
        <a
          href={urlBoton || '#'}
          onClick={handleLinkClick(urlBoton)}
          {...propsTarget}
          className="olo-tarjeta-articulo-btn inline-flex items-center text-body text-neutral-800 dark:text-neutral-200 bg-neutral-secondary-medium bg-neutral-100 dark:bg-neutral-700 box-border border border-default-medium border-neutral-300 dark:border-neutral-600 hover:bg-neutral-tertiary-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-heading hover:text-neutral-900 dark:hover:text-white focus:ring-4 focus:ring-neutral-tertiary focus:ring-neutral-200 dark:focus:ring-neutral-600 shadow-xs font-medium leading-5 rounded-base rounded-lg text-sm px-4 py-2.5 focus:outline-none transition-colors"
        >
          <span>{textoBoton}</span>
          <svg
            className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 12H5m14 0-4 4m4-4-4-4"
            />
          </svg>
        </a>
      )}
      </div>
    </div>
  );
}
