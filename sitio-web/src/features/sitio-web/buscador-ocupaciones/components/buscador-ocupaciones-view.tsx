'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Breadcrumb, type BreadcrumbItem } from '@/shared/ui/molecules/breadcrumb';
import { BuscadorOcupacionesBanner } from './buscador-ocupaciones-banner';

/**
 * Rótulo del tercer nivel de la ruta según `?tipo=`. El menú ya no enlaza así —CNO y
 * CUOC tienen página propia en `/clasificacion/cno` y `/clasificacion/cuoc`—; se
 * conserva para los enlaces con `?tipo=` que ya estén repartidos.
 */
const ETIQUETAS_TIPO: Record<string, string> = {
  cuoc: 'Clasificación Única de Ocupaciones para Colombia',
  cno: 'Clasificación Nacional de Ocupaciones',
};

const BREADCRUMB_BASE: BreadcrumbItem[] = [
  { label: 'Inicio', href: '/inicio' },
  { label: 'Clasificaciones' },
];

function ClasificacionBreadcrumb() {
  const searchParams = useSearchParams();
  const etiquetaTipo = ETIQUETAS_TIPO[searchParams.get('tipo') ?? ''];

  const items: BreadcrumbItem[] = etiquetaTipo
    ? [{ label: 'Inicio', href: '/inicio' }, { label: 'Clasificaciones', href: '/clasificacion' }, { label: etiquetaTipo }]
    : BREADCRUMB_BASE;

  return <Breadcrumb items={items} />;
}

/**
 * Buscador de ocupaciones (RF-09): banner de búsqueda y, sobre él, las dos
 * vistas de consulta encadenadas —resultados y detalle— dentro de un mismo
 * diálogo.
 *
 * La búsqueda en sí la aporta `BuscadorOcupacionesBanner`, que es el mismo
 * componente que pinta el bloque del editor: así esta página y la portada
 * consultan el catálogo por el mismo camino.
 */
export function BuscadorOcupacionesView() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <Suspense fallback={<Breadcrumb items={BREADCRUMB_BASE} />}>
          <ClasificacionBreadcrumb />
        </Suspense>
        <BuscadorOcupacionesBanner />
      </div>

      <p className="text-sm text-[#667085]">
        Ingresa un código, denominación u ocupación para consultar el catálogo CNO/CUOC.
      </p>
    </div>
  );
}
