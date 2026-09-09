'use client';

import { Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { OcupacionSearchBanner } from '@/shared/ui/molecules/ocupacion-search-banner';
import { Breadcrumb, type BreadcrumbItem } from '@/shared/ui/molecules/breadcrumb';
import { useBuscadorOcupaciones } from '../hooks/use-buscador-ocupaciones';
import { useDetalleOcupacion } from '../hooks/use-detalle-ocupacion';
import { DetalleOcupacion } from './detalle-ocupacion';
import { ModalOcupaciones } from './modal-ocupaciones';
import { ResultadosOcupaciones } from './resultados-ocupaciones';

/** Rótulo del tercer nivel de la ruta según `?tipo=`, el mismo valor que enlaza el dropdown de "Clasificaciones" en el menú. */
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
 * Es **un solo** `ModalOcupaciones` que cambia de contenido, y no dos apilados:
 * dos diálogos modales a la vez se disputan el foco y el bloqueo del scroll, y
 * el de atrás queda accesible al tabulador aunque no se vea. Con un único
 * diálogo, "volver a los resultados" es un cambio de estado y nada más.
 */
export function BuscadorOcupacionesView() {
  const { resultados, terminoBuscado, loading, consultaRealizada, buscar, limpiar } =
    useBuscadorOcupaciones();
  const {
    codigoAbierto,
    detalle,
    loading: cargandoDetalle,
    abrir,
    cerrar: cerrarDetalle,
  } = useDetalleOcupacion();

  const cerrarTodo = useCallback(() => {
    cerrarDetalle();
    limpiar();
  }, [cerrarDetalle, limpiar]);

  // Mientras el detalle carga todavía no hay `detalle.nombreOcupacion`, pero la
  // fila que se acaba de pulsar ya trae el nombre: se usa para que el
  // encabezado no aparezca vacío durante la consulta.
  const ocupacionSeleccionada = resultados.find((fila) => fila.codigoOcupacion === codigoAbierto);
  const codigoTitulo = detalle?.codigoOcupacion ?? codigoAbierto ?? '';
  const nombreTitulo = detalle?.nombreOcupacion ?? ocupacionSeleccionada?.nombreOcupacion ?? '';

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <Suspense fallback={<Breadcrumb items={BREADCRUMB_BASE} />}>
          <ClasificacionBreadcrumb />
        </Suspense>
        <OcupacionSearchBanner onSearch={buscar} />
      </div>

      <p className="text-sm text-[#667085]">
        Ingresa un código, denominación u ocupación para consultar el catálogo CNO/CUOC.
      </p>

      <ModalOcupaciones
        abierto={consultaRealizada}
        onCerrar={cerrarTodo}
        claveContenido={codigoAbierto ?? 'resultados'}
        antetitulo={codigoAbierto ? 'Ocupación' : 'Resultados de la búsqueda'}
        titulo={
          codigoAbierto ? (
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="rounded-[8px] bg-white/10 px-2 py-1 font-mono text-sm tabular-nums">
                {codigoTitulo}
              </span>
              <span>{nombreTitulo}</span>
            </span>
          ) : (
            'Clasificación Nacional de Ocupaciones'
          )
        }
        pie={
          codigoAbierto ? (
            <button
              type="button"
              onClick={cerrarDetalle}
              className="flex cursor-pointer items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-sm font-medium text-[#001631] transition-colors hover:bg-[#001631]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB828]"
            >
              <ArrowLeftIcon aria-hidden="true" className="size-4" />
              Volver a los resultados
            </button>
          ) : undefined
        }
      >
        {codigoAbierto ? (
          <DetalleOcupacion detalle={detalle} loading={cargandoDetalle} />
        ) : (
          <ResultadosOcupaciones
            resultados={resultados}
            termino={terminoBuscado}
            loading={loading}
            onSeleccionar={abrir}
          />
        )}
      </ModalOcupaciones>
    </div>
  );
}
