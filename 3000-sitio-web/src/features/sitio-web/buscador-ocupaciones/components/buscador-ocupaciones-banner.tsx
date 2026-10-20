'use client';

import { useCallback, type ComponentProps } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { OcupacionSearchBanner } from '@/shared/ui/molecules/ocupacion-search-banner';
import { useBuscadorOcupaciones } from '../hooks/use-buscador-ocupaciones';
import { useDetalleOcupacion } from '../hooks/use-detalle-ocupacion';
import { DetalleOcupacion } from './detalle-ocupacion';
import { ModalOcupaciones } from './modal-ocupaciones';
import { ResultadosOcupaciones } from './resultados-ocupaciones';

/** Todo lo visual lo decide el banner; aquí solo se añade la consulta. */
type BuscadorOcupacionesBannerProps = Omit<
  ComponentProps<typeof OcupacionSearchBanner>,
  'value' | 'onValueChange' | 'onSearch'
>;

/**
 * El banner de búsqueda con la consulta al catálogo ya conectada.
 *
 * Existe porque el banner suelto (`OcupacionSearchBanner`) es solo presentación:
 * sin `onSearch` su formulario no lleva a ninguna parte. El bloque de Puck lo
 * pintaba así, de modo que en la portada se podía escribir y pulsar la lupa sin
 * que ocurriera nada —el buscador "no buscaba"—, mientras que la página de
 * `/clasificacion` sí funcionaba porque conectaba los hooks por su cuenta.
 *
 * Ese cableado vive ahora aquí, en un único sitio: cualquiera que coloque el
 * banner —el bloque del editor o una página escrita a mano— obtiene la búsqueda
 * completa, con sus dos vistas encadenadas dentro del mismo diálogo.
 */
export function BuscadorOcupacionesBanner(props: BuscadorOcupacionesBannerProps) {
  const { resultados, terminoBuscado, loading, error, consultaRealizada, buscar, limpiar } =
    useBuscadorOcupaciones();
  const {
    codigoAbierto,
    detalle,
    loading: cargandoDetalle,
    error: errorDetalle,
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
    <>
      <OcupacionSearchBanner {...props} onSearch={buscar} />

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
          <DetalleOcupacion detalle={detalle} loading={cargandoDetalle} error={errorDetalle} />
        ) : (
          <ResultadosOcupaciones
            resultados={resultados}
            termino={terminoBuscado}
            loading={loading}
            error={error}
            onSeleccionar={abrir}
          />
        )}
      </ModalOcupaciones>
    </>
  );
}
