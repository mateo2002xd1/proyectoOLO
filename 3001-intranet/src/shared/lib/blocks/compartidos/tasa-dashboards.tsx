import type { ReactNode } from 'react';
import { ATRIBUTOS_DE_IFRAME_SEGURO, iframeSeguro } from '@olo/url-policy';

export interface TableroTasa {
  titulo?: ReactNode;
  descripcion?: ReactNode;
  urlPowerBi?: string;
}

export interface TasaDashboardsProps {
  tableros?: TableroTasa[];
}

export function TasaDashboards({ tableros = [] }: TasaDashboardsProps) {
  if (tableros.length === 0) return null;

  return (
    <section className="tasa-dashboards-section">
      <div className="tasa-dashboards-grid">
        {tableros.map((tablero, indice) => {
          const iframeTitle =
            typeof tablero.titulo === 'string'
              ? tablero.titulo.replace(/<[^>]*>/g, '').trim() || `Tablero ${indice + 1}`
              : `Tablero ${indice + 1}`;

          return (
            <div className="tasa-dashboard-card" key={`tablero-${indice}`}>
              <div className="tasa-dashboard-header">
                {tablero.titulo && <h2 className="tasa-dashboard-title">{tablero.titulo}</h2>}
                {tablero.descripcion && <div className="tasa-dashboard-desc">{tablero.descripcion}</div>}
              </div>
              {/* Solo un host de la lista de `@olo/url-policy` (XSS-04): un `iframe` con `javascript:`
                  se ejecuta al cargar, y uno con un sitio ajeno es un marco de phishing dentro de la intranet. */}
              {iframeSeguro(tablero.urlPowerBi) && (
                <div className="tasa-dashboard-iframe-wrapper">
                  <iframe
                    title={iframeTitle}
                    src={iframeSeguro(tablero.urlPowerBi)}
                    allowFullScreen
                    className="tasa-dashboard-iframe"
                    {...ATRIBUTOS_DE_IFRAME_SEGURO}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

