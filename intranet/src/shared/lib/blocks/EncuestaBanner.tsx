import { resaltar } from './resaltar';

/**
 * Cabecera de la encuesta de seguimiento laboral: texto a la izquierda,
 * ilustración a la derecha, sobre el degradado azul institucional.
 *
 * La ilustración va espejada (`scaleX(-1)`) porque el original mira hacia fuera
 * de la página; se deja como decisión del bloque y no como campo para que nadie
 * tenga que saberlo al editar.
 */
export interface EncuestaBannerProps {
  antetitulo?: string;
  titulo?: string;
  imagenSrc?: string;
  imagenAlt?: string;
}

export function EncuestaBanner({
  antetitulo = 'Encuesta de',
  titulo = 'SEGUIMIENTO LABORAL',
  imagenSrc = '/assets/img/banner-seguimiento-laboral.png',
  imagenAlt = 'Ilustración Seguimiento Laboral',
}: EncuestaBannerProps) {
  return (
    <section className="w-full bg-gradient-to-r from-[#001631] to-[#001A39] flex justify-center py-10 md:py-14 px-6 md:px-12">
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        <div className="text-white text-center md:text-left">
          {antetitulo && (
            <p className="text-lg md:text-xl font-light tracking-wide mb-1 opacity-90">
              {antetitulo}
            </p>
          )}
          <h1 className="text-2xl md:text-4xl font-bold tracking-wide">{resaltar(titulo)}</h1>
        </div>

        {imagenSrc && (
          <div className="flex-shrink-0">
            {/* src editable desde el editor: next/image exigiria dimensiones fijas */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagenSrc}
              alt={imagenAlt}
              className="object-contain"
              style={{ width: '260px', height: 'auto', transform: 'scaleX(-1)' }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
