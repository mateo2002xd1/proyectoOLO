/**
 * Sección de video sobre fondo azul.
 *
 * La URL debe ser la de inserción de YouTube (`/embed/...`), no la de la barra de
 * direcciones: `youtube.com/watch?v=X` no carga dentro de un iframe. Se normaliza
 * aquí para que pegar el enlace de siempre funcione igual.
 *
 * Lleva además una descarga opcional debajo del video, que es como está montada
 * la encuesta de calidad de la formación (el video y el botón de «Descargar» los
 * datos comparten la misma franja azul). Sin `descargaUrl` no se pinta nada, así
 * que las secciones que solo tienen video no cambian.
 */
import type { ReactNode } from 'react';

export interface TasaVideoProps {
  tituloInicio?: ReactNode;
  tituloDestacado?: ReactNode;
  videoUrl?: string;
  descargaTexto?: ReactNode;
  descargaEtiqueta?: ReactNode;
  descargaUrl?: string;
  descargaNombre?: string;
}

const aUrlDeInsercion = (url: string): string => {
  const conParametroV = url.match(/[?&]v=([\w-]{11})/);
  if (conParametroV) return `https://www.youtube.com/embed/${conParametroV[1]}`;

  const enlaceCorto = url.match(/youtu\.be\/([\w-]{11})/);
  if (enlaceCorto) return `https://www.youtube.com/embed/${enlaceCorto[1]}`;

  return url;
};

export function TasaVideo({
  tituloInicio = 'Aquí te contamos todo sobre la estrategia de Tasa de',
  tituloDestacado = 'Vinculación y Empleabilidad',
  videoUrl = 'https://www.youtube.com/embed/4E7Sci4DAVQ',
  descargaTexto,
  descargaEtiqueta = 'Descargar',
  descargaUrl,
  descargaNombre,
}: TasaVideoProps) {
  return (
    <section className="tasa-video-wrapper">
      <div className="tasa-video-header">
        <h2 className="tasa-video-title">
          {tituloInicio} <br className="hidden md:block" />
          <span>{tituloDestacado}</span>
        </h2>
      </div>
      <div className="tasa-video-container">
        <iframe
          className="tasa-video-iframe"
          src={aUrlDeInsercion(videoUrl)}
          title={typeof tituloDestacado === 'string' ? tituloDestacado : 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {descargaUrl && (
        <div className="tasa-video-descarga">
          {descargaTexto && <p>{descargaTexto}</p>}
          <a
            href={descargaUrl}
            download={
              descargaNombre ||
              (descargaUrl?.includes('?nombre=')
                ? decodeURIComponent(descargaUrl.split('?nombre=')[1]?.split('&')[0] ?? '')
                : '') ||
              (typeof descargaEtiqueta === 'string' && descargaEtiqueta.trim()
                ? descargaEtiqueta.trim()
                : true)
            }
            className="tasa-video-descarga-boton"
          >
            {descargaEtiqueta}
          </a>
        </div>
      )}
    </section>
  );
}
