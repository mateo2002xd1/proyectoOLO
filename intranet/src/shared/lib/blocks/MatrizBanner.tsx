import { resaltar } from './resaltar';

/**
 * Franja de cabecera de la Matriz de Pertinencia.
 *
 * No reutiliza `TasaBanner` porque el montaje es distinto: aquí el título y la
 * ilustración van dentro de `.bannerOficialMatriz`, con las esquinas inferiores
 * redondeadas y la imagen a un tamaño fijo. Comparten la tipografía del título
 * (`.tasa-banner-title`) y ahí acaba el parecido.
 */
export interface MatrizBannerProps {
  titulo?: string;
  imagenSrc?: string;
  imagenAlt?: string;
}

export function MatrizBanner({
  titulo = 'Matriz de **PERTINENCIA**',
  imagenSrc = '/assets/img/BannerOficial.png',
  imagenAlt = 'Matriz de Pertinencia',
}: MatrizBannerProps) {
  return (
    <section className="intranet-hero">
      <div
        className="bannerOficialMatriz py-8 md:py-0"
        style={{ maxWidth: '1240px', width: '100%', borderRadius: '0 0 16px 16px' }}
      >
        <h1 className="tasa-banner-title text-left mb-8 md:mb-0 mr-0 md:mr-16">
          {resaltar(titulo)}
        </h1>
        {imagenSrc && (
          // src editable desde el editor: next/image exigiria dimensiones fijas
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagenSrc}
            alt={imagenAlt}
            style={{ width: '350px', maxWidth: '100vw', height: 'auto', objectFit: 'cover' }}
          />
        )}
      </div>
    </section>
  );
}
