'use client';

import Link from 'next/link';
import { resaltarCoincidenciaTexto } from '@olo/blocks-renderer';
import type { ResultadoOcupacion } from '../types';

interface ResultadosOcupacionesProps {
  resultados: ResultadoOcupacion[];
  /** Término de la última consulta; se resalta dentro de cada coincidencia. */
  termino: string;
  loading: boolean;
  /** Mensaje de la consulta fallida; se pinta en lugar del "sin coincidencias", que sería falso. */
  error?: string | null;
  /** La URL de la vista ampliada de una ocupación. */
  hrefDe: (codigoOcupacion: string) => string;
}

/** Denominaciones que se listan en la fila antes de resumir el resto en un "+N más". */
const DENOMINACIONES_VISIBLES = 6;

/** Verde institucional sobre fondo claro: el resaltado por defecto del paquete es para fondo oscuro. */
const CLASE_RESALTADO = 'rounded bg-[#7DB828]/30 px-0.5 text-[#001631]';

/**
 * Vista 1 — tabla de resultados.
 *
 * Dos columnas: a la izquierda la ocupación (`cod_ocupacion_cno` +
 * `nomb_ocupacion_cno`), a la derecha sus denominaciones
 * (`descr_denominacion_cno` unidas por el código de la ocupación).
 *
 * Cada fila es un enlace y no una `<tr>` con `onClick` porque la fila entera lleva al
 * detalle, que es otra URL: como enlace se alcanza con el tabulador, responde a Enter y
 * se puede abrir en otra pestaña o copiar.
 */
export function ResultadosOcupaciones({
  resultados,
  termino,
  loading,
  error,
  hrefDe,
}: ResultadosOcupacionesProps) {
  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-[#667085]" aria-live="polite">
        Consultando el catálogo de ocupaciones…
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-10 text-center text-sm text-[#344054]" role="alert">
        {error}
      </p>
    );
  }

  if (resultados.length === 0) {
    return (
      <div className="py-10 text-center" aria-live="polite">
        <p className="text-sm font-medium text-[#344054]">
          No hay ocupaciones que coincidan con «{termino}».
        </p>
        <p className="mt-1 text-sm text-[#667085]">
          Prueba con el código de la ocupación, con su nombre o con una denominación.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[#667085]" aria-live="polite">
        {resultados.length === 1
          ? '1 ocupación encontrada'
          : `${resultados.length} ocupaciones encontradas`}{' '}
        para «<span className="font-medium text-[#344054]">{termino}</span>»
      </p>

      <div className="overflow-hidden rounded-[16px] border border-[#eaecf0]">
        {/* Los rótulos de columna se ocultan en móvil, donde cada celda lleva el suyo propio. */}
        <div className="hidden bg-[#f8f9fa] sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:gap-4 sm:px-4 sm:py-2.5">
          <span className="text-[11px] tracking-[0.12em] text-[#667085] uppercase">
            Ocupación
          </span>
          <span className="text-[11px] tracking-[0.12em] text-[#667085] uppercase">
            Denominación
          </span>
        </div>

        <ul className="divide-y divide-[#eaecf0]">
          {resultados.map((ocupacion) => {
            const mostradas =
              ocupacion.denominacionesCoincidentes.length > 0
                ? ocupacion.denominacionesCoincidentes
                : ocupacion.denominaciones;
            const restantes = mostradas.length - DENOMINACIONES_VISIBLES;

            return (
              <li key={`${ocupacion.tipo}-${ocupacion.codigoOcupacion}`}>
                <Link
                  href={hrefDe(ocupacion.codigoOcupacion)}
                  scroll={false}
                  aria-label={`Ver el detalle de la ocupación ${ocupacion.codigoOcupacion} ${ocupacion.nombreOcupacion}`}
                  className="grid w-full grid-cols-1 gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#f8f9fa] focus:outline-none focus-visible:bg-[#f8f9fa] focus-visible:ring-2 focus-visible:ring-[#7DB828] focus-visible:ring-inset sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:gap-4"
                >
                  <span className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0 rounded-[8px] bg-[var(--olo-modal-acento,#001631)] px-2 py-1 font-mono text-[11px] text-white tabular-nums">
                      {resaltarCoincidenciaTexto(
                        ocupacion.codigoOcupacion,
                        termino,
                        'rounded bg-[#7DB828]/60 px-0.5 text-white',
                      )}
                    </span>
                    <span className="min-w-0 text-sm font-medium text-[#344054]">
                      {resaltarCoincidenciaTexto(
                        ocupacion.nombreOcupacion,
                        termino,
                        CLASE_RESALTADO,
                      )}
                    </span>
                  </span>

                  <span className="min-w-0">
                    <span className="mb-1 block text-[11px] tracking-[0.12em] text-[#98a2b3] uppercase sm:hidden">
                      Denominación
                    </span>

                    {mostradas.length === 0 ? (
                      <span className="text-sm text-[#98a2b3] italic">Sin denominaciones</span>
                    ) : (
                      <span className="flex flex-wrap gap-x-1.5 gap-y-1 text-sm text-[#667085]">
                        {mostradas.slice(0, DENOMINACIONES_VISIBLES).map((denominacion, indice) => (
                          <span key={denominacion}>
                            {resaltarCoincidenciaTexto(denominacion, termino, CLASE_RESALTADO)}
                            {indice < Math.min(mostradas.length, DENOMINACIONES_VISIBLES) - 1 && ','}
                          </span>
                        ))}
                        {restantes > 0 && <span className="text-[#98a2b3]">y {restantes} más</span>}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
