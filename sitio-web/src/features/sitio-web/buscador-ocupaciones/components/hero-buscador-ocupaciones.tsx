'use client';

import { Suspense, useCallback, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { OcupacionSearchBanner } from '@/shared/ui/molecules/ocupacion-search-banner';
import { useBuscadorOcupaciones } from '../hooks/use-buscador-ocupaciones';
import { useDetalleOcupacion } from '../hooks/use-detalle-ocupacion';
import { ModalOcupaciones } from './modal-ocupaciones';
import { ResultadosOcupaciones } from './resultados-ocupaciones';
import { DetalleOcupacion } from './detalle-ocupacion';

const ETIQUETAS_TIPO: Record<string, string> = {
  cuoc: 'Clasificación Única de Ocupaciones para Colombia',
  cno: 'Clasificación Nacional de Ocupaciones',
};

export interface HeroBuscadorOcupacionesProps {
  titulo?: ReactNode;
  searchPlaceholder?: string;
  placeholder?: string;
  imageUrl?: string;
  logoSrc?: string;
  imageAlt?: string;
  logoAlt?: string;
  modelSrc?: string;
  modelAlt?: string;
  colorFondo?: string;
  className?: string;
}

function TituloModal({
  codigoAbierto,
  codigoTitulo,
  nombreTitulo,
}: {
  codigoAbierto: string | null;
  codigoTitulo: string;
  nombreTitulo: string;
}) {
  const searchParams = useSearchParams();
  const etiquetaTipo = ETIQUETAS_TIPO[searchParams.get('tipo') ?? ''];

  if (codigoAbierto) {
    return (
      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="rounded-[8px] bg-white/10 px-2 py-1 font-mono text-sm tabular-nums">
          {codigoTitulo}
        </span>
        <span>{nombreTitulo}</span>
      </span>
    );
  }

  return <span>{etiquetaTipo || 'Clasificación Nacional de Ocupaciones'}</span>;
}

/**
 * Componente del banner buscador de ocupaciones interactivo para Puck y páginas públicas.
 *
 * Conecta el banner visual con el flujo completo de búsqueda (`useBuscadorOcupaciones`),
 * consulta de detalles (`useDetalleOcupacion`) y diálogo modal con resultados (`ModalOcupaciones`).
 */
export function HeroBuscadorOcupaciones({
  titulo,
  searchPlaceholder,
  placeholder,
  imageUrl,
  logoSrc,
  imageAlt,
  logoAlt,
  modelSrc,
  modelAlt,
  colorFondo,
  className = 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6',
}: HeroBuscadorOcupacionesProps) {
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

  const ocupacionSeleccionada = resultados.find((fila) => fila.codigoOcupacion === codigoAbierto);
  const codigoTitulo = detalle?.codigoOcupacion ?? codigoAbierto ?? '';
  const nombreTitulo = detalle?.nombreOcupacion ?? ocupacionSeleccionada?.nombreOcupacion ?? '';

  return (
    <div className={className}>
      <OcupacionSearchBanner
        titulo={titulo}
        placeholder={searchPlaceholder || placeholder || 'Buscar ocupación, código o denominación'}
        logoSrc={imageUrl || logoSrc || '/assets/img/nos-ocupa-el-pais.png'}
        logoAlt={imageAlt || logoAlt || 'Nos ocupa el país'}
        modelSrc={modelSrc || '/assets/img/modelo-uno.png'}
        modelAlt={modelAlt || 'Modelo'}
        colorFondo={colorFondo}
        onSearch={buscar}
      />

      <ModalOcupaciones
        abierto={consultaRealizada}
        onCerrar={cerrarTodo}
        claveContenido={codigoAbierto ?? 'resultados'}
        antetitulo={codigoAbierto ? 'Ocupación' : 'Resultados de la búsqueda'}
        titulo={
          <Suspense fallback={<span>Clasificación Nacional de Ocupaciones</span>}>
            <TituloModal
              codigoAbierto={codigoAbierto}
              codigoTitulo={codigoTitulo}
              nombreTitulo={nombreTitulo}
            />
          </Suspense>
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
