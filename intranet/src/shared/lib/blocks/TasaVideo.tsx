/**
 * Sección de video sobre fondo azul.
 *
 * La URL debe ser la de inserción de YouTube (`/embed/...`), no la de la barra de
 * direcciones: `youtube.com/watch?v=X` no carga dentro de un iframe. Se normaliza
 * aquí para que pegar el enlace de siempre funcione igual.
 */
export interface TasaVideoProps {
  tituloInicio?: string;
  tituloDestacado?: string;
  videoUrl?: string;
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
          title={tituloDestacado}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}
