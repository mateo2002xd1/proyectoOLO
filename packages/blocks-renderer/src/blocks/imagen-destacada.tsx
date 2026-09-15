import type { ReactNode } from 'react';

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

export interface ImagenDestacadaProps {
  id?: string;
  titulo?: ReactNode;
  mostrarTitulo?: boolean;
  subtitulo?: ReactNode;
  mostrarSubtitulo?: boolean;
  imagenSrc?: string;
  imagenAlt?: string;
  ancho?: 'contenido' | 'completo';
  fondo?: 'blanco' | 'gris';
  ajusteImagen?: 'cover' | 'contain';
  redondeado?: 'ninguno' | 'pequeno' | 'grande' | 'circular';
  className?: string;
}

export function ImagenDestacada({
  titulo,
  mostrarTitulo = true,
  subtitulo,
  mostrarSubtitulo = true,
  imagenSrc,
  imagenAlt = '',
  ancho = 'completo',
  fondo = 'blanco',
  ajusteImagen = 'contain',
  redondeado = 'grande',
  className = '',
}: ImagenDestacadaProps) {
  if (!imagenSrc) return null;

  const clasesFondo = fondo === 'gris' ? 'matriz-section-gray' : 'matriz-section-white';

  if (ancho === 'contenido') {
    return (
      <div className={`${clasesFondo} ${className}`.trim()}>
        <div className="matriz-sabias-que">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagenSrc}
            alt={imagenAlt}
            className="w-full h-auto object-contain"
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
        {mostrarTitulo && titulo && (
          <h2 className={`matriz-section-title text-[#041E42] font-bold ${mostrarSubtitulo && subtitulo ? 'mb-3' : 'mb-6'}`}>{titulo}</h2>
        )}
        {mostrarSubtitulo && subtitulo && (
          <div className="text-gray-600 mb-6 text-sm sm:text-base max-w-2xl mx-auto">{subtitulo}</div>
        )}
        <div className="w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagenSrc}
            alt={imagenAlt}
            className={`w-full max-w-[1200px] mx-auto h-auto shadow-sm ${CLASES_AJUSTE[ajusteImagen] ?? CLASES_AJUSTE.contain} ${CLASES_REDONDEADO[redondeado] ?? ''}`.trim()}
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
