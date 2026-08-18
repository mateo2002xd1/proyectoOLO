import { resaltar } from '../compartidos/resaltar';

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
    <section className="intranet-hero" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '0 1.5rem' }}>
      <div
        className="tasa-banner-wrapper"
        style={{ 
          maxWidth: '1240px', 
          width: '100%', 
          borderRadius: '0 0 16px 16px',
          background: '#001631',
          padding: '4rem 1.5rem',
          margin: '0 auto'
        }}
      >
        <div className="tasa-banner-content" style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', margin: '0 auto' }}>
          <h1 className="tasa-banner-title text-left mb-8 md:mb-0 mr-0 md:mr-8" style={{ flex: '1', minWidth: '300px' }}>
            {resaltar(titulo)}
          </h1>
          {imagenSrc && (
            // src editable desde el editor: next/image exigiria dimensiones fijas
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagenSrc}
              alt={imagenAlt}
              style={{ width: '100%', maxWidth: '400px', height: '195px', objectFit: 'contain', filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.3))' }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
