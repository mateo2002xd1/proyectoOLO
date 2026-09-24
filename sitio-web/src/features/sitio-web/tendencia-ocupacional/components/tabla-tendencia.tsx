'use client';

import { useMemo } from 'react';
import { Paginacion } from '@/shared/ui/molecules/paginacion';
import type { RegistroTendenciaOcupacional } from '../types';

interface TotalesTendencia {
  totalInscritos: number;
  totalVacantes: number;
}

interface TablaTendenciaProps {
  resultados: RegistroTendenciaOcupacional[];
  totalResultados: number;
  departamentoActivo: string | null;
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
  totales?: TotalesTendencia;
  mostrarTotales?: boolean;
}

export function TablaTendencia({
  resultados,
  totalResultados,
  departamentoActivo,
  pagina,
  totalPaginas,
  onCambiarPagina,
  totales,
  mostrarTotales = false,
}: TablaTendenciaProps) {
  const subtotalPagina = useMemo(() => {
    return resultados.reduce(
      (acc, r) => {
        acc.totalInscritos += r.inscritos;
        acc.totalVacantes += r.vacantes;
        return acc;
      },
      { totalInscritos: 0, totalVacantes: 0 }
    );
  }, [resultados]);

  if (totalResultados === 0) {
    return (
      <div
        className="rounded-[20px] border border-[#eaecf0] bg-white py-10 text-center"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-[#344054]">
          No hay registros{departamentoActivo ? ` en ${departamentoActivo}` : ' para este filtro'}.
        </p>
        <p className="mt-1 text-sm text-[#667085]">
          Prueba seleccionando otro departamento, año, periodo o nivel ocupacional.
        </p>
      </div>
    );
  }

  const hayTotales = mostrarTotales && totales;

  return (
    <div>
      <p className="mb-4 text-sm text-[#667085]" aria-live="polite">
        {totalResultados === 1 ? '1 registro encontrado' : `${totalResultados} registros encontrados`}
        {departamentoActivo && (
          <>
            {' '}
            en <span className="font-medium text-[#344054]">{departamentoActivo}</span>
          </>
        )}
      </p>

      <div className="overflow-x-auto rounded-[16px] border border-[#eaecf0] bg-white shadow-sm">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#eaecf0] bg-[#f8f9fa]">
              <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Nivel Ocupacional
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Código C.N.O.
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Nombre Ocupación
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Total Inscritos
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Total Vacantes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecf0]">
            {resultados.map((registro) => (
              <tr
                key={registro.codigo}
                className="transition-colors hover:bg-[#f8f9fa]"
              >
                <td className="px-4 py-3.5 font-medium text-[#344054]">
                  {registro.nivelEtiqueta}
                </td>
                <td className="px-4 py-3.5 tabular-nums text-[#667085]">
                  {registro.codigo}
                </td>
                <td className="px-4 py-3.5 font-medium text-[#001631]">
                  {registro.nombre}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-[#344054]">
                  {registro.inscritos.toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-[#39a900]">
                  {registro.vacantes.toLocaleString('es-CO')}
                </td>
              </tr>
            ))}
          </tbody>

          {hayTotales && (
            <tfoot className="border-t-2 border-[#d0d5dd] bg-[#f8f9fa]">
              {totalPaginas > 1 && (
                <tr className="border-b border-[#eaecf0] text-xs text-[#475467]">
                  <td colSpan={3} className="px-4 py-2 text-left font-medium">
                    Subtotal esta página ({resultados.length} registros)
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold text-[#344054]">
                    {subtotalPagina.totalInscritos.toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold text-[#39a900]">
                    {subtotalPagina.totalVacantes.toLocaleString('es-CO')}
                  </td>
                </tr>
              )}
              <tr className="bg-[#f0f4f8]">
                <td
                  colSpan={3}
                  className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#001631]"
                >
                  Total general {totalPaginas > 1 ? `(${totalResultados.toLocaleString('es-CO')} registros)` : ''}
                </td>
                <td className="px-4 py-3.5 text-right font-bold tabular-nums text-sm text-[#001631]">
                  {totales.totalInscritos.toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3.5 text-right font-bold tabular-nums text-sm text-[#39a900]">
                  {totales.totalVacantes.toLocaleString('es-CO')}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {totalPaginas > 1 && (
        <Paginacion
          pagina={pagina}
          totalPaginas={totalPaginas}
          onCambiarPagina={onCambiarPagina}
          tono="publico"
          ariaLabel="Paginación de resultados"
          className="mt-4"
        />
      )}
    </div>
  );
}
