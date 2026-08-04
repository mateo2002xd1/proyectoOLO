import { resaltar } from './resaltar';

/**
 * Rejilla de tarjetas que enlazan a las respuestas de cada conferencia.
 *
 * La versión anterior tenía los enlaces sin rellenar (`AQUI_VA_LINK_1`), así que
 * las dos tarjetas llevaban a ninguna parte. Aquí una tarjeta sin URL se pinta
 * sin enlace en lugar de fingir que es pulsable: es preferible que se vea que
 * todavía no hay destino a que alguien haga clic y no pase nada.
 */
export interface TarjetaPregunta {
  imagenSrc?: string;
  imagenAlt?: string;
  texto?: string;
  url?: string;
}

export interface PreguntasFrecuentesProps {
  titulo?: string;
  tarjetas?: TarjetaPregunta[];
}

export function PreguntasFrecuentes({
  titulo = '**Preguntas** Frecuentes',
  tarjetas = [],
}: PreguntasFrecuentesProps) {
  if (tarjetas.length === 0) return null;

  return (
    <div className="preguntas-section">
      <div className="matriz-content-container-wide max-w-[1200px] w-full mx-auto text-center flex flex-col items-center">
        {titulo && <h2 className="preguntas-title">{resaltar(titulo)}</h2>}
        <div className="preguntas-grid">
          {tarjetas.map((tarjeta, indice) => {
            const imagen = tarjeta.imagenSrc ? (
              // src editable desde el editor: next/image exigiria dimensiones fijas
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tarjeta.imagenSrc}
                alt={tarjeta.imagenAlt ?? tarjeta.texto ?? ''}
                className="preguntas-card-img"
              />
            ) : null;

            return (
              <div className="preguntas-card" key={`${tarjeta.texto ?? 'tarjeta'}-${indice}`}>
                {tarjeta.url ? (
                  <a
                    href={tarjeta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="preguntas-card-link"
                  >
                    {imagen}
                  </a>
                ) : (
                  <div className="preguntas-card-link">{imagen}</div>
                )}
                <div className="preguntas-card-content">
                  <p className="preguntas-card-text">{tarjeta.texto}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
