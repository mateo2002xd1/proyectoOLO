/**
 * Bloques de concepto en zig-zag: texto a un lado, imagen al otro, alternando.
 *
 * El lado no se configura, se deduce de la posición: los pares van con la imagen a
 * la derecha y los impares al revés. Así al reordenar o añadir conceptos el zig-zag
 * se mantiene solo, sin que nadie tenga que acordarse de invertir el de al lado.
 */
export interface ConceptoTasa {
  titulo?: string;
  descripcion?: string;
  imagenSrc?: string;
  imagenAlt?: string;
}

export interface TasaConceptosProps {
  conceptos?: ConceptoTasa[];
}

export function TasaConceptos({ conceptos = [] }: TasaConceptosProps) {
  if (conceptos.length === 0) return null;

  return (
    <section className="tasa-concepts-wrapper">
      {conceptos.map((concepto, indice) => (
        <div
          key={`${concepto.titulo ?? 'concepto'}-${indice}`}
          className={`tasa-concept-row${indice % 2 === 1 ? ' reverse' : ''}`}
        >
          <div className="tasa-concept-text">
            <h2 className="tasa-concept-title">{concepto.titulo}</h2>
            <p className="tasa-concept-desc">{concepto.descripcion}</p>
          </div>
          {concepto.imagenSrc && (
            <div className="tasa-concept-visual">
              {/* src editable desde el editor: next/image exigiria dimensiones fijas */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={concepto.imagenSrc}
                alt={concepto.imagenAlt ?? concepto.titulo ?? ''}
                className="tasa-concept-image"
              />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
