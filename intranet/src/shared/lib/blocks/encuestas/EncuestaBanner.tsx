
/**
 * Cabecera de la encuesta: texto + ilustración sobre fondo azul institucional.
 * La prop `imagenDerecha` controla el orden:
 *   - false (por defecto): imagen izquierda, texto derecha
 *   - true: texto izquierda, imagen derecha
 */
export interface EncuestaBannerProps {
  antetitulo?: string;
  titulo?: string;
  imagenSrc?: string;
  imagenAlt?: string;
  imagenDerecha?: boolean;
}

export function EncuestaBanner({
  antetitulo = 'Encuesta de',
  titulo = 'SEGUIMIENTO LABORAL',
  imagenSrc = '/assets/img/banner-seguimiento-laboral.png',
  imagenAlt = 'Ilustración encuesta',
  imagenDerecha = false,
}: EncuestaBannerProps) {
  const texto = (
    <h1 className="tasa-banner-title text-white">
      {antetitulo}
      <br />
      <strong>{titulo}</strong>
    </h1>
  );

  const imagen = imagenSrc ? (
    <div className="flex-shrink-0">
      {/* src editable desde el editor: next/image exigiria dimensiones fijas */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagenSrc}
        alt={imagenAlt}
        className="tasa-banner-image survey-banner-image"
        style={imagenDerecha ? { transform: 'scaleX(-1)' } : undefined}
      />
    </div>
  ) : null;

  return (
    <section className="tasa-banner-wrapper">
      <div className="tasa-banner-content encuesta-banner-content">
        {imagenDerecha ? texto : imagen}
        {imagenDerecha ? imagen : texto}
      </div>
    </section>
  );
}
