'use client';

import { PptxViewer } from './PptxViewer';
import type { ReactNode } from 'react';

/**
 * Lista de enlaces a un lado y visor de presentación al otro.
 *
 * Es el mismo montaje en matriz («Descargas» con las matrices por año) y en la
 * encuesta de calidad de la formación («Página Web Observatorio Laboral»), así
 * que comparten bloque y las clases `.tasa-ppt-*` que ya usaban las dos.
 *
 * La presentación es opcional: si no hay archivo, la lista ocupa la sección sola
 * en vez de dejar un hueco con un visor vacío.
 */
export interface EnlaceDescarga {
  etiqueta?: string;
  url?: string;
}

export interface DescargasConPresentacionProps {
  titulo?: ReactNode;
  enlaces?: EnlaceDescarga[];
  archivoUrl?: string;
}

export function DescargasConPresentacion({
  titulo,
  enlaces = [],
  archivoUrl,
}: DescargasConPresentacionProps) {
  // Sin URL el elemento se pinta como texto, no como enlace. Antes se ponía `#`
  // y quedaba algo que parecía pulsable y no llevaba a ninguna parte; y hay
  // listas, como la de la encuesta de calidad, que nunca fueron enlaces.
  const elementos = enlaces.filter((enlace) => enlace.etiqueta);

  return (
    <section className="tasa-ppt-section">
      <div className="tasa-ppt-container">
        <div className="tasa-ppt-text">
          <h2 className="tasa-ppt-title" style={{ marginBottom: '1.5rem' }}>
            {titulo}
          </h2>
          {elementos.length > 0 && (
            <ul className="list-disc pl-6 text-[#1C2A48] text-lg md:text-xl space-y-2 marker:text-[#0A1B3F]">
              {elementos.map((elemento, indice) => (
                <li key={`${elemento.etiqueta}-${indice}`}>
                  {elemento.url ? (
                    <a
                      href={elemento.url}
                      className="hover:underline transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {elemento.etiqueta}
                    </a>
                  ) : (
                    elemento.etiqueta
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {archivoUrl && (
          <div className="tasa-ppt-viewer-wrapper">
            <PptxViewer fileUrl={archivoUrl} />
          </div>
        )}
      </div>
    </section>
  );
}
