import { resaltar } from '../compartidos/resaltar';

/**
 * Cabecera de la encuesta: texto a la izquierda, ilustración a la derecha,
 * sobre el degradado azul institucional.
 *
 * Usa las mismas clases CSS que TasaBanner (.tasa-banner-wrapper,
 * .tasa-banner-content) para garantizar márgenes, padding y max-width
 * idénticos en todas las vistas de la intranet.
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
    <section className="tasa-banner-wrapper">
      <div className="tasa-banner-content">
        <div className="text-white">
          {antetitulo && (
            <p className="text-lg md:text-xl font-light tracking-wide mb-1 opacity-90">
              {antetitulo}
            </p>
          )}
          <h1 className="tasa-banner-title">{resaltar(titulo)}</h1>
        </div>

        {imagenSrc && (
          <div className="flex-shrink-0">
            {/* src editable desde el editor: next/image exigiria dimensiones fijas */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagenSrc}
              alt={imagenAlt}
              className="tasa-banner-image survey-banner-image"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
