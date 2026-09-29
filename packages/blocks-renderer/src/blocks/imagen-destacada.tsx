'use client';

import React, { useState, useEffect, type ReactNode } from 'react';

/**
 * Una imagen ancha con título opcional.
 *
 * Cubre las secciones que son «un titular y una imagen grande»: el #datoOLO de
 * inicio, el «sabías que» de matriz y las capturas de resultados de encuestas.
 *
 * `ancho` distingue los dos tamaños: «contenido» es la caja estrecha con
 * esquinas redondeadas del «sabías que», y «completo» la imagen a todo lo
 * ancho del contenedor.
 */
const CLASES_AJUSTE: Record<string, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
};
const CLASES_REDONDEADO: Record<string, string> = {
  ninguno: '',
  pequeno: 'rounded-md',
  grande: 'rounded-xl',
  circular: 'rounded-full',
};

const PLACEHOLDER_IMAGEN_DESTACADA =
  'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221200%22%20height%3D%22500%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201200%20500%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23f8fafc%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23f1f5f9%22%2F%3E%3C%2FlinearGradient%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2232%22%20height%3D%2232%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2032%200%20L%200%200%200%2032%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%221%22%20opacity%3D%220.5%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%221200%22%20height%3D%22500%22%20fill%3D%22url(%23bg)%22%20rx%3D%2216%22%2F%3E%3Crect%20width%3D%221200%22%20height%3D%22500%22%20fill%3D%22url(%23grid)%22%20rx%3D%2216%22%2F%3E%3Crect%20x%3D%2216%22%20y%3D%2216%22%20width%3D%221168%22%20height%3D%22468%22%20fill%3D%22none%22%20stroke%3D%22%23041E42%22%20stroke-opacity%3D%220.25%22%20stroke-width%3D%222%22%20stroke-dasharray%3D%228%2C8%22%20rx%3D%2212%22%2F%3E%3Ccircle%20cx%3D%22600%22%20cy%3D%22200%22%20r%3D%2248%22%20fill%3D%22%23041E42%22%20opacity%3D%220.06%22%2F%3E%3Cpath%20d%3D%22M582%20210l12-12a4%204%200%200%201%205.6%200l24%2024m-10-10l6-6a4%204%200%200%201%205.6%200l18%2018M570%20228h60a4%204%200%200%200%204-4V182a4%204%200%200%200-4-4h-60a4%204%200%200%200-4%204v42a4%204%200%200%200%204%204zm10-34a4%204%200%201%201-8%200%204%204%200%200%201%208%200z%22%20stroke%3D%22%23041E42%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20fill%3D%22none%22%2F%3E%3Ctext%20x%3D%22600%22%20y%3D%22285%22%20font-family%3D%22system-ui%2C%20-apple-system%2C%20sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22600%22%20fill%3D%22%23041E42%22%20text-anchor%3D%22middle%22%3EImagen%20Destacada%20(Vista%20Previa)%3C%2Ftext%3E%3Ctext%20x%3D%22600%22%20y%3D%22315%22%20font-family%3D%22system-ui%2C%20-apple-system%2C%20sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2364748b%22%20text-anchor%3D%22middle%22%3ESube%20o%20selecciona%20una%20imagen%20en%20el%20panel%20lateral%20derecho%3C%2Ftext%3E%3C%2Fsvg%3E';

export interface ImagenDestacadaProps {
  id?: string;
  titulo?: ReactNode;
  mostrarTitulo?: boolean;
  subtitulo?: ReactNode;
  mostrarSubtitulo?: boolean;
  colorTitulo?: string;
  imagenSrc?: string;
  imagenAlt?: string;
  ancho?: 'contenido' | 'completo';
  fondo?: 'blanco' | 'gris';
  ajusteImagen?: 'cover' | 'contain';
  redondeado?: 'ninguno' | 'pequeno' | 'grande' | 'circular';
  className?: string;
  esEdicion?: boolean;
  puck?: { isEditing?: boolean };
}

export function ImagenDestacada({
  titulo,
  mostrarTitulo = true,
  subtitulo,
  mostrarSubtitulo = true,
  colorTitulo,
  imagenSrc,
  imagenAlt = '',
  ancho = 'completo',
  fondo = 'blanco',
  ajusteImagen = 'contain',
  redondeado = 'grande',
  className = '',
  esEdicion,
  puck,
}: ImagenDestacadaProps) {
  const enEdicion =
    esEdicion ??
    Boolean(puck?.isEditing) ??
    (typeof window !== 'undefined' &&
      (window.location.pathname.includes('/editor') ||
        window.location.pathname.includes('/plantilla') ||
        window.location.pathname.includes('/admin/editor') ||
        window.location.pathname.includes('/admin/plantilla')));

  const tieneImagen = Boolean(imagenSrc && imagenSrc.trim());
  const esVistaPrevia = enEdicion && !tieneImagen;

  const [srcEfectiva, setSrcEfectiva] = useState<string>(
    tieneImagen ? (imagenSrc as string) : (enEdicion ? PLACEHOLDER_IMAGEN_DESTACADA : '')
  );

  useEffect(() => {
    setSrcEfectiva(tieneImagen ? (imagenSrc as string) : (enEdicion ? PLACEHOLDER_IMAGEN_DESTACADA : ''));
  }, [imagenSrc, tieneImagen, enEdicion]);

  // Si no hay imagen y no estamos en edición, el bloque no se pinta en el sitio publicado
  if (!tieneImagen && !enEdicion) return null;

  const clasesFondo = fondo === 'gris' ? 'matriz-section-gray' : 'matriz-section-white';

  if (ancho === 'contenido') {
    return (
      <div className={`${clasesFondo} ${className}`.trim()}>
        <div className="matriz-sabias-que">
          {esVistaPrevia && (
            <div className="mb-4 inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-sm mx-auto w-full text-center">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Vista previa · Añade o edita la imagen desde el panel lateral derecho</span>
            </div>
          )}
          {mostrarTitulo && titulo && (
            <h2
              className={`matriz-section-title text-[#041E42] font-bold text-center ${mostrarSubtitulo && subtitulo ? 'mb-3' : 'mb-6'}`}
              style={colorTitulo ? { color: colorTitulo } : undefined}
            >
              {titulo}
            </h2>
          )}
          {mostrarSubtitulo && subtitulo && (
            <div className="text-gray-600 mb-6 text-sm sm:text-base max-w-2xl mx-auto text-center">{subtitulo}</div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={srcEfectiva}
            alt={imagenAlt || (esVistaPrevia ? 'Vista previa de imagen destacada' : '')}
            className="w-full h-auto object-contain"
            onError={() => {
              if (enEdicion && srcEfectiva !== PLACEHOLDER_IMAGEN_DESTACADA) {
                setSrcEfectiva(PLACEHOLDER_IMAGEN_DESTACADA);
              }
            }}
            onLoad={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('resize'));
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${clasesFondo} w-full py-12 ${className}`.trim()}>
      <div className="max-w-[1200px] w-full mx-auto px-6 text-center flex flex-col items-center">
        {esVistaPrevia && (
          <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-sm mx-auto">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Vista previa · Añade o edita la imagen desde el panel lateral derecho</span>
          </div>
        )}
        {mostrarTitulo && titulo && (
          <h2
            className={`matriz-section-title text-[#041E42] font-bold ${mostrarSubtitulo && subtitulo ? 'mb-3' : 'mb-6'}`}
            style={colorTitulo ? { color: colorTitulo } : undefined}
          >
            {titulo}
          </h2>
        )}
        {mostrarSubtitulo && subtitulo && (
          <div className="text-gray-600 mb-6 text-sm sm:text-base max-w-2xl mx-auto">{subtitulo}</div>
        )}
        <div className="w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={srcEfectiva}
            alt={imagenAlt || (esVistaPrevia ? 'Vista previa de imagen destacada' : '')}
            className={`w-full max-w-[1200px] mx-auto h-auto shadow-sm ${CLASES_AJUSTE[ajusteImagen] ?? CLASES_AJUSTE.contain} ${CLASES_REDONDEADO[redondeado] ?? ''}`.trim()}
            onError={() => {
              if (enEdicion && srcEfectiva !== PLACEHOLDER_IMAGEN_DESTACADA) {
                setSrcEfectiva(PLACEHOLDER_IMAGEN_DESTACADA);
              }
            }}
            onLoad={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('resize'));
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
