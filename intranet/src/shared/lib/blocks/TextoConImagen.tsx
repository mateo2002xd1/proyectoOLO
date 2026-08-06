import type { ReactNode } from 'react';
import { resaltar } from './resaltar';

/**
 * Dos columnas: texto con formato a un lado, imagen al otro.
 *
 * Es el montaje de «¿Cuál es el objetivo?» en la encuesta de calidad de la
 * formación y de «Portal de aprendizaje» en la de seguimiento laboral. El texto
 * es un campo `richtext` porque son párrafos con negritas en mitad de la frase,
 * que es justo lo que no se puede resolver partiendo el campo en dos.
 *
 * `pieDeImagen` existe porque una de las dos lleva una leyenda verde debajo de
 * la captura; sin texto, no se pinta nada.
 */
export interface TextoConImagenProps {
  titulo?: string;
  contenido?: ReactNode;
  imagenSrc?: string;
  imagenAlt?: string;
  pieDeImagen?: string;
  ladoImagen?: 'derecha' | 'izquierda';
  fondo?: 'gris' | 'blanco';
}

export function TextoConImagen({
  titulo,
  contenido,
  imagenSrc,
  imagenAlt = '',
  pieDeImagen,
  ladoImagen = 'derecha',
  fondo = 'gris',
}: TextoConImagenProps) {
  const columnaTexto = (
    <div className="flex-1 space-y-6 max-w-3xl tasa-concept-desc">
      {contenido}
    </div>
  );

  const columnaImagen = imagenSrc ? (
    <div className="flex-1 w-full flex flex-col items-center lg:items-end">
      <div className="relative w-full max-w-lg h-auto rounded-xl overflow-hidden bg-white shadow-sm">
        {/* src editable desde el editor: next/image exigiria dimensiones fijas */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagenSrc} alt={imagenAlt} className="w-full h-auto object-contain" />
      </div>
      {pieDeImagen && (
        <p className="mt-4 text-[#2e7d32] font-bold text-center lg:text-right w-full max-w-lg pr-4">
          {pieDeImagen}
        </p>
      )}
    </div>
  ) : null;

  return (
    <section
      className={`px-4 md:px-12 flex justify-center ${fondo === 'gris' ? 'bg-[#f4f5f7]' : 'bg-white'}`}
      style={{ paddingTop: '4rem', paddingBottom: '4rem' }}
    >
      <div className="max-w-7xl w-full">
        {titulo && (
          <h2 className="tasa-concept-title">
            {resaltar(titulo)}
          </h2>
        )}
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
