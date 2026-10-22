'use client';

import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { PARAM_BUSCAR, PARAM_OCUPACION } from '../lib/destino-de-busqueda';
import { useBuscadorOcupaciones } from '../hooks/use-buscador-ocupaciones';
import { useDetalleOcupacion } from '../hooks/use-detalle-ocupacion';
import { DetalleOcupacion } from './detalle-ocupacion';
import { ResultadosOcupaciones } from './resultados-ocupaciones';

/**
 * Lo que se ve bajo el buscador cuando la URL trae una consulta: los resultados
 * (`?buscar=…`) o la ficha ampliada de una ocupación (`?buscar=…&ocupacion=…`). Sin ninguno
 * de los dos no pinta nada, salvo que la página sea la de resultados y pase `sinConsulta`.
 *
 * Antes eran dos vistas encadenadas dentro de un diálogo. Ahora son parte de la página:
 * cada una tiene su URL (se puede enlazar, recargar y volver con «atrás»), su encabezado
 * entra en el esquema de la página para quien navega con un lector de pantalla, y se lee
 * a cualquier zoom sin un panel con su propio desplazamiento.
 *
 * Al cambiar de vista el foco pasa al encabezado: sin eso, quien usa el teclado o un lector
 * se queda en el enlace que pulsó, que ya no existe, y no se entera de que cambió el contenido.
 */
export function ConsultaOcupaciones({
  colorAcento,
  sinConsulta,
}: {
  colorAcento?: string;
  /** Lo que se ve cuando la URL no trae consulta. Vacío = nada (bajo un buscador). */
  sinConsulta?: ReactNode;
}) {
  const parametros = useSearchParams();
  const ruta = usePathname();
  const idTitulo = useId();
  const titulo = useRef<HTMLHeadingElement>(null);

  const termino = parametros.get(PARAM_BUSCAR)?.trim() ?? '';
  const codigo = parametros.get(PARAM_OCUPACION)?.trim() || null;

  // Los resultados se piden también con la ficha abierta: dan el nombre mientras ella carga
  // y evitan volver a consultar al regresar a la lista.
  const { resultados, loading, error } = useBuscadorOcupaciones(termino);
  const {
    detalle,
    loading: cargandoDetalle,
    error: errorDetalle,
  } = useDetalleOcupacion(codigo);

  const vista = codigo ? `ocupacion:${codigo}` : termino ? `buscar:${termino}` : '';
  useEffect(() => {
    if (vista) titulo.current?.focus();
  }, [vista]);

  if (!vista) {
    return sinConsulta ? (
      <section className="mx-auto w-full max-w-[1200px] bg-white px-4 py-8 sm:px-6 sm:py-10">
        {sinConsulta}
      </section>
    ) : null;
  }

  const hrefResultados = `${ruta}?${PARAM_BUSCAR}=${encodeURIComponent(termino)}`;
  const hrefDe = (codigoOcupacion: string) =>
    `${hrefResultados}&${PARAM_OCUPACION}=${encodeURIComponent(codigoOcupacion)}`;

  // Mientras la ficha carga todavía no hay `detalle.nombreOcupacion`, pero la fila que se
  // pulsó ya trae el nombre: así el encabezado no aparece vacío durante la consulta.
  const seleccionada = resultados.find((fila) => fila.codigoOcupacion === codigo);
  const codigoTitulo = detalle?.codigoOcupacion ?? codigo ?? '';
  const nombreTitulo = detalle?.nombreOcupacion ?? seleccionada?.nombreOcupacion ?? '';

  return (
    <section
      aria-labelledby={idTitulo}
      className="mx-auto w-full max-w-[1200px] bg-white px-4 py-8 text-[#344054] sm:px-6 sm:py-10"
      // En una variable y no en cada pieza: el color del código de cada fila lo pintan
      // `ResultadosOcupaciones` y `DetalleOcupacion`, que no lo reciben.
      style={colorAcento ? ({ '--olo-modal-acento': colorAcento } as CSSProperties) : undefined}
    >
      {codigo && termino && (
        <Link
          href={hrefResultados}
          scroll={false}
          className="mb-5 inline-flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-sm font-medium text-[#001631] transition-colors hover:bg-[#001631]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB828]"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          Volver a los resultados
        </Link>
      )}

      {codigo && <p className="text-[11px] tracking-[0.14em] text-[#667085] uppercase">Ocupación</p>}
      <h2
        id={idTitulo}
        ref={titulo}
        tabIndex={-1}
        className="mt-1 text-xl leading-snug font-semibold text-[#001631] outline-none sm:text-2xl"
      >
        {codigo ? (
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="rounded-[8px] bg-[#001631] px-2 py-1 font-mono text-sm text-white tabular-nums">
              {codigoTitulo}
            </span>
            <span>{nombreTitulo}</span>
          </span>
        ) : (
          'Resultados de la búsqueda'
        )}
      </h2>

      <div className="mt-6">
        {codigo ? (
          <DetalleOcupacion detalle={detalle} loading={cargandoDetalle} error={errorDetalle} />
        ) : (
          <ResultadosOcupaciones
            resultados={resultados}
            termino={termino}
            loading={loading}
            error={error}
            hrefDe={hrefDe}
          />
        )}
      </div>
    </section>
  );
}
