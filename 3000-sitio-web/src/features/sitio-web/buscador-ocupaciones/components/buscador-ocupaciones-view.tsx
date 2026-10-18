'use client';

import { BuscadorOcupacionesBanner } from './buscador-ocupaciones-banner';

/**
 * Buscador de ocupaciones (RF-09): banner de búsqueda y, sobre él, las dos
 * vistas de consulta encadenadas —resultados y detalle— dentro de un mismo
 * diálogo.
 *
 * La búsqueda en sí la aporta `BuscadorOcupacionesBanner`, que es el mismo
 * componente que pinta el bloque del editor: así esta página y la portada
 * consultan el catálogo por el mismo camino.
 *
 * Las migas de pan ya no van aquí: las pone el layout público en todas las páginas
 * (`MigasDePan`). Con ellas se fue el tercer eslabón de los enlaces viejos con `?tipo=`.
 */
export function BuscadorOcupacionesView() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <BuscadorOcupacionesBanner />

      <p className="text-sm text-[#667085]">
        Ingresa un código, denominación u ocupación para consultar el catálogo CNO/CUOC.
      </p>
    </div>
  );
}
