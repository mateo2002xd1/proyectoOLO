'use client';

import type { ReactNode } from 'react';
import { PptxViewer } from './PptxViewer';

/**
 * Dos columnas: texto con formato a un lado, imagen (o visor de presentación) al otro.
 *
 * Es el montaje de «¿Cuál es el objetivo?» en la encuesta de calidad de la
 * formación y de «Portal de aprendizaje» en la de seguimiento laboral. El texto
 * es un campo `richtext` porque son párrafos con negritas en mitad de la frase,
 * que es justo lo que no se puede resolver partiendo el campo en dos.
 *
 * `pieDeImagen` existe porque una de las dos lleva una leyenda verde debajo de
 * la captura; sin texto, no se pinta nada.
 *
 * `archivoUrl` es opcional: cuando se provee, el lado derecho muestra el visor
 * de presentación PPTX en lugar de una imagen estática.
 */
export interface TextoConImagenProps {
  titulo?: ReactNode;
  mostrarTitulo?: boolean;
  subtitulo?: ReactNode;
  mostrarSubtitulo?: boolean;
  contenido?: ReactNode;
  imagenSrc?: string;
  imagenAlt?: string;
  pieDeImagen?: ReactNode;
  archivoUrl?: string;
  ladoImagen?: 'derecha' | 'izquierda';
  fondo?: 'gris' | 'blanco';
}

export function TextoConImagen({
  titulo,
  mostrarTitulo = true,
  subtitulo,
  mostrarSubtitulo = true,
  contenido,
  imagenSrc,
  imagenAlt = '',
  pieDeImagen,
  archivoUrl,
  ladoImagen = 'derecha',
  fondo = 'gris',
}: TextoConImagenProps) {
  const columnaTexto = (
    <div className="flex-1 space-y-6 max-w-3xl tasa-concept-desc md:mt-6">
      {mostrarTitulo && titulo && (
        <h2 className="tasa-concept-title" style={{ marginTop: 0 }}>
          {titulo}
        </h2>
      )}
      {mostrarSubtitulo && subtitulo && (
        <div className="text-gray-600 text-sm sm:text-base font-medium -mt-2 mb-2">
          {subtitulo}
        </div>
      )}
      {contenido}
    </div>
  );

  // Si hay archivoUrl, se muestra el visor de presentación; si no, la imagen estática.
  const columnaImagen = archivoUrl ? (
    <div className="tasa-ppt-viewer-wrapper">
      <PptxViewer fileUrl={archivoUrl} />
    </div>
  ) : imagenSrc ? (
    <div className="flex-1 w-full flex flex-col items-center lg:items-end">
      <div className="relative w-full max-w-lg h-auto rounded-xl overflow-hidden bg-white shadow-sm">
        {/* src editable desde el editor: next/image exigiria dimensiones fijas */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagenSrc} alt={imagenAlt} className="w-full h-auto object-contain" />
      </div>
      {pieDeImagen && (
        <p
          style={{ marginTop: '2rem' }}
          className="text-[#2e7d32] font-bold text-center lg:text-right w-full max-w-lg pr-4"
        >
          {pieDeImagen}
        </p>
      )}
    </div>
  ) : null;

  return (
    <section
      className={`px-6 flex justify-center ${fondo === 'gris' ? 'bg-[#f4f5f7]' : 'bg-white'}`}
      style={{ paddingTop: '4rem', paddingBottom: '4rem' }}
    >
      <div className="max-w-[1200px] w-full">
        <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
          {ladoImagen === 'izquierda' ? (
            <>
              {columnaImagen}
              {columnaTexto}
            </>
          ) : (
            <>
              {columnaTexto}
              {columnaImagen}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
