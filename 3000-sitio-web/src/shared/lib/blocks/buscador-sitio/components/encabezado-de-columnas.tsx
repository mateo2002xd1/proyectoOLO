import type { ColoresDeLosResultados } from '../lib/colores';

/**
 * La fila de títulos de la tabla de resultados («Página / Sección» y «Contenido
 * coincidente»). Se ve cuando el bloque mide lo suficiente para dos columnas; más
 * estrecho, cada resultado es una tarjeta y los títulos sobran.
 */
export function EncabezadoDeColumnas({ colores }: { colores: ColoresDeLosResultados }) {
  const clase = 'text-[11px] uppercase tracking-[0.12em]';
  return (
    <div
      style={{ backgroundColor: colores.cabeceraTabla }}
      className="hidden @xl:grid @xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] @xl:gap-4 @xl:px-4 @xl:py-2.5"
    >
      <span style={{ color: colores.textoCabeceraTabla }} className={clase}>
        Página / Sección
      </span>
      <span style={{ color: colores.textoCabeceraTabla }} className={clase}>
        Contenido coincidente
      </span>
    </div>
  );
}
