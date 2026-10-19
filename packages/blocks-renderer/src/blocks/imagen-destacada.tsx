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

const escaparXml = (texto: string) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Muestra del editor para un bloque que aún no tiene imagen: sin fondo, solo el borde
 * punteado, el icono en gris (25×19 escalado ×3 y centrado) y dos líneas de texto.
 * La usan «Imagen destacada» y el «Carrusel de imágenes» del sitio.
 */
export function muestraDeImagen(titulo: string, ayuda: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg width="1200" height="500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500">' +
      '<rect x="16" y="16" width="1168" height="468" fill="none" stroke="#041E42" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="8,8" rx="12"/>' +
      '<path transform="translate(562.5 171.5) scale(3)" fill="#9ca3af" d="M22.6562 18.75H2.34375C1.04932 18.75 0 17.7007 0 16.4062V2.34375C0 1.04932 1.04932 0 2.34375 0H22.6562C23.9507 0 25 1.04932 25 2.34375V16.4062C25 17.7007 23.9507 18.75 22.6562 18.75ZM5.46875 2.73438C3.95859 2.73438 2.73438 3.95859 2.73438 5.46875C2.73438 6.97891 3.95859 8.20312 5.46875 8.20312C6.97891 8.20312 8.20312 6.97891 8.20312 5.46875C8.20312 3.95859 6.97891 2.73438 5.46875 2.73438ZM3.125 15.625H21.875V10.1562L17.6018 5.88306C17.373 5.65425 17.002 5.65425 16.7731 5.88306L10.1562 12.5L7.44556 9.78931C7.21675 9.5605 6.84575 9.5605 6.61689 9.78931L3.125 13.2812V15.625Z"/>' +
      '<text x="600" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#041E42" text-anchor="middle">' + escaparXml(titulo) + '</text>' +
      '<text x="600" y="315" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">' + escaparXml(ayuda) + '</text>' +
      '</svg>',
  )}`;
}

const PLACEHOLDER_IMAGEN_DESTACADA = muestraDeImagen(
  'Imagen Destacada',
  'Sube o selecciona una imagen en el panel lateral derecho'
);

/** Una de las tarjetas que montan sobre el borde inferior de la imagen. */
export interface TarjetaDestacada {
  /** Lo pone el editor al agregarla, para que la lista no confunda tarjetas al mover o borrar. */
  id?: string;
  imagen?: string;
  titulo?: string;
  enlace?: string;
  nuevaPestana?: boolean;
}

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
  /** Color libre de la sección; si viene, manda sobre `fondo`. */
  colorFondo?: string;
  tarjetas?: TarjetaDestacada[];
  /** Las dos tarjetas fijas de la primera versión; solo se leen si no hay `tarjetas`. */
  tarjeta1?: TarjetaDestacada;
  tarjeta2?: TarjetaDestacada;
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
  colorFondo,
  tarjetas: listaTarjetas,
  tarjeta1,
  tarjeta2,
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
  const estiloFondo = colorFondo?.trim() ? { backgroundColor: colorFondo } : undefined;
  const tarjetas = Array.isArray(listaTarjetas)
    ? listaTarjetas
    : [tarjeta1, tarjeta2].filter((t): t is TarjetaDestacada => t !== undefined);
  const conTarjetas = hayTarjetas(tarjetas, enEdicion);
  const nodoTarjetas = conTarjetas ? <TarjetasDestacadas tarjetas={tarjetas} enEdicion={enEdicion} /> : null;
  // Con tarjetas, la sección se queda sin relleno abajo y las tarjetas cuelgan media
  // altura sobre el bloque siguiente (ver `.olo-imagen-destacada--con-tarjetas`).
  const claseTarjetas = conTarjetas ? 'olo-imagen-destacada--con-tarjetas' : '';

  if (ancho === 'contenido') {
    return (
      <div className={`${clasesFondo} olo-imagen-destacada ${claseTarjetas} ${className}`.trim()} style={estiloFondo}>
        <div className="matriz-sabias-que olo-imagen-destacada__contenido">
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
          {nodoTarjetas}
        </div>
      </div>
    );
  }

  return (
    <div className={`${clasesFondo} olo-imagen-destacada w-full py-12 ${claseTarjetas} ${className}`.trim()} style={estiloFondo}>
      <div className="olo-imagen-destacada__contenido max-w-[1200px] w-full mx-auto px-6 text-center flex flex-col items-center">
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
            className={`w-full max-w-[1200px] mx-auto h-auto ${esVistaPrevia ? '' : 'shadow-sm'} ${CLASES_AJUSTE[ajusteImagen] ?? CLASES_AJUSTE.contain} ${CLASES_REDONDEADO[redondeado] ?? ''}`.trim()}
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
          {nodoTarjetas}
        </div>
      </div>
    </div>
  );
}

function tieneContenido(tarjeta?: TarjetaDestacada): boolean {
  return Boolean(tarjeta?.imagen?.trim() || tarjeta?.titulo?.trim());
}

/**
 * Si se pintan las tarjetas. Una lista vacía —la intranet, que no las ofrece, o un
 * bloque sin tarjetas agregadas— no pinta nada, ni huecos. En el sitio, solo si
 * alguna tiene imagen o título; en el editor, también las que aún están vacías.
 */
function hayTarjetas(tarjetas: TarjetaDestacada[], enEdicion: boolean): boolean {
  if (tarjetas.length === 0) return false;
  return enEdicion || tarjetas.some(tieneContenido);
}

/**
 * Las tarjetas que montan sobre el borde inferior de la imagen (diseño del inicio:
 * «Emprender» y «Buscar empleo»). Son una lista: quien edita agrega las que quiera
 * y pasan a otra fila si no caben. Sus estilos viven en el `globals.css` del sitio
 * (`.olo-tarjetas-destacadas`): Tailwind de la app no recorre este paquete.
 *
 * Una tarjeta sin imagen ni título no se pinta en el sitio; en el editor deja un
 * hueco punteado para que se vea dónde va. Con enlace, la tarjeta entera es el
 * enlace (sin botón aparte); sin enlace es un `<div>`, no un enlace que no lleva a
 * ningún lado.
 */
function TarjetasDestacadas({
  tarjetas,
  enEdicion,
}: {
  tarjetas: TarjetaDestacada[];
  enEdicion: boolean;
}) {
  return (
    <div className="olo-tarjetas-destacadas">
      {tarjetas.map((tarjeta, i) => {
        if (!tieneContenido(tarjeta)) {
          return enEdicion ? (
            <div key={tarjeta.id ?? i} className="olo-tarjeta-destacada olo-tarjeta-destacada--vacia">
              Tarjeta {i + 1}: añade su imagen y su título en el panel
            </div>
          ) : null;
        }

        const titulo = tarjeta.titulo?.trim();
        const enlace = tarjeta.enlace?.trim();
        const contenido = (
          <>
            {tarjeta.imagen?.trim() && (
              // eslint-disable-next-line @next/next/no-img-element -- la imagen la sube quien edita y su tamaño va por CSS
              <img src={tarjeta.imagen} alt={titulo ? '' : 'Tarjeta sin título'} className="olo-tarjeta-destacada__imagen" />
            )}
            {titulo && <span className="olo-tarjeta-destacada__titulo">{titulo}</span>}
          </>
        );

        return enlace ? (
          <a
            key={tarjeta.id ?? i}
            href={enlace}
            className="olo-tarjeta-destacada"
            {...(tarjeta.nuevaPestana ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {contenido}
          </a>
        ) : (
          <div key={tarjeta.id ?? i} className="olo-tarjeta-destacada">
            {contenido}
          </div>
        );
      })}
    </div>
  );
}
