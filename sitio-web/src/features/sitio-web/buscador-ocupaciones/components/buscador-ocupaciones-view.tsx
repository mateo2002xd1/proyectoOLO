'use client';

import { OcupacionSearchBanner } from '@/shared/ui/molecules/ocupacion-search-banner';
import { useBuscadorOcupaciones } from '../hooks/use-buscador-ocupaciones';

export function BuscadorOcupacionesView() {
  const { resultados, loading, buscar } = useBuscadorOcupaciones();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <OcupacionSearchBanner onSearch={buscar} />

      {loading && <p className="text-sm text-[#667085]">Buscando…</p>}

      {!loading && resultados.length === 0 && (
        <p className="text-sm text-[#667085]">
          Ingresa un código, denominación u ocupación para consultar el catálogo CNO/CUOC.
        </p>
      )}

      {!loading && resultados.length > 0 && (
        <ul className="flex flex-col gap-3">
          {resultados.map((ocupacion) => (
            <li key={ocupacion.codigoCno} className="rounded-xl border border-[#eaecf0] p-4">
              <p className="font-medium text-[#344054]">{ocupacion.denominacion}</p>
              <p className="text-sm text-[#667085]">
                CNO {ocupacion.codigoCno}
                {ocupacion.codigoCuoc ? ` · CUOC ${ocupacion.codigoCuoc}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
