/**
 * Tarjetas con los tableros de Power BI incrustados.
 *
 * El enlace que se guarda es el de "Publicar en la web" de Power BI
 * (`app.powerbi.com/view?r=...`). Cambiar de tablero es cambiar esa URL: no hace
 * falta tocar código, que es justo lo que se buscaba al pasar la página al editor.
 */
export interface TableroTasa {
  titulo?: string;
  descripcion?: string;
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
        {tableros.map((tablero, indice) => (
          <div className="tasa-dashboard-card" key={`${tablero.titulo ?? 'tablero'}-${indice}`}>
            <div className="tasa-dashboard-header">
              <h2 className="tasa-dashboard-title">{tablero.titulo}</h2>
              <p className="tasa-dashboard-desc">{tablero.descripcion}</p>
            </div>
            {tablero.urlPowerBi && (
              <div className="tasa-dashboard-iframe-wrapper">
                <iframe
                  title={tablero.titulo || `Tablero ${indice + 1}`}
                  src={tablero.urlPowerBi}
                  allowFullScreen
                  className="tasa-dashboard-iframe"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
