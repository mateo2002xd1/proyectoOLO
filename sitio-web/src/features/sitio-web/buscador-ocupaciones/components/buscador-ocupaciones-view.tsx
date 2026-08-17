'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OcupacionSearchBanner } from '@/shared/ui/molecules/ocupacion-search-banner';
import { Breadcrumb, type BreadcrumbItem } from '@/shared/ui/molecules/breadcrumb';
import { useBuscadorOcupaciones } from '../hooks/use-buscador-ocupaciones';

/** Rótulo del tercer nivel de la ruta según `?tipo=`, el mismo valor que enlaza el dropdown de "Clasificaciones" en el menú. */
const ETIQUETAS_TIPO: Record<string, string> = {
  cuoc: 'Clasificación Única de Ocupaciones para Colombia',
  cno: 'Clasificación Nacional de Ocupaciones',
};

const BREADCRUMB_BASE: BreadcrumbItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Clasificaciones' },
];

function ClasificacionBreadcrumb() {
  const searchParams = useSearchParams();
  const etiquetaTipo = ETIQUETAS_TIPO[searchParams.get('tipo') ?? ''];

  const items: BreadcrumbItem[] = etiquetaTipo
    ? [{ label: 'Inicio', href: '/' }, { label: 'Clasificaciones', href: '/clasificacion' }, { label: etiquetaTipo }]
    : BREADCRUMB_BASE;

  return <Breadcrumb items={items} />;
}

export function BuscadorOcupacionesView() {
  const { resultados, loading, buscar } = useBuscadorOcupaciones();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <Suspense fallback={<Breadcrumb items={BREADCRUMB_BASE} />}>
          <ClasificacionBreadcrumb />
        </Suspense>
        <OcupacionSearchBanner onSearch={buscar} />
      </div>

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
