import type { ReactNode } from 'react';

interface DatoOloSemanaProps {
  block: { id: string };
  tituloResaltado?: ReactNode;
  tituloNormal?: ReactNode;
  imagenSrc?: string;
  imagenAlt?: string;
}

/**
 * «Un titular y una imagen grande»: la infografía semanal ya trae el dato, la
 * fuente y el hashtag dibujados dentro del PNG, así que el bloque solo pone el
 * título de la sección y el marco alrededor de la imagen.
 */
export function DatoOloSemana({
  block,
  tituloResaltado = 'Dato OLO',
  tituloNormal = 'de la semana',
  imagenSrc = '/assets/img/dato-olo-semana.png',
  imagenAlt = 'Dato OLO de la semana',
}: DatoOloSemanaProps) {
  return (
    <section className="olo-dato-semana" id="dato-olo-semana" aria-label="Dato OLO de la semana" data-block-id={block.id}>
      <div className="olo-dato-semana-inner">
        <h2 className="olo-dato-semana-title">
          {tituloResaltado}
          {tituloNormal && <span className="olo-dato-semana-title-normal"> {tituloNormal}</span>}
        </h2>

        {imagenSrc && (
          <div className="olo-dato-semana-frame">
            {/* src editable desde el editor: next/image exigiria dimensiones fijas */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imagenSrc} 
              alt={imagenAlt} 
              className="olo-dato-semana-img"
              onLoad={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('resize'));
                }
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
