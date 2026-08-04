/**
 * Franja azul de cabecera de Tasa: un título en dos partes y una ilustración.
 *
 * El título se parte en dos campos en vez de admitir HTML porque la segunda mitad
 * va en negrita: así quien edita escribe texto plano y el estilo lo pone el bloque.
 */
export interface TasaBannerProps {
  tituloInicio?: string;
  tituloDestacado?: string;
  imagenSrc?: string;
  imagenAlt?: string;
}

export function TasaBanner({
  tituloInicio = 'Tasa de',
  tituloDestacado = 'Vinculación y Empleabilidad',
  imagenSrc = '/assets/img/BannerTasa.png',
  imagenAlt = 'Tasa de Vinculación y Empleabilidad',
}: TasaBannerProps) {
  return (
    <section className="tasa-banner-wrapper">
      <div className="tasa-banner-content">
        <h1 className="tasa-banner-title">
          {tituloInicio}
          <br />
          <strong>{tituloDestacado}</strong>
        </h1>
        {imagenSrc && (
          // src editable desde el editor: next/image exigiria dimensiones fijas
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagenSrc} alt={imagenAlt} className="tasa-banner-image" />
        )}
      </div>
    </section>
  );
}
