'use client';

import { useMemo } from 'react';
import { Paginador } from '@/features/sitio-web/tendencia-ocupacional/components/paginador';
import type { RegistroFuenteFutura } from '../types';

interface TablaFuentesFuturasProps {
  resultados: RegistroFuenteFutura[];
  totalResultados: number;
  totalCuentaProyectos: number;
  departamentoActivo: string | null;
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
  mostrarTotales?: boolean;
}

export function TablaFuentesFuturas({
  resultados,
  totalResultados,
  totalCuentaProyectos,
  departamentoActivo,
  pagina,
  totalPaginas,
  onCambiarPagina,
  mostrarTotales = true,
}: TablaFuentesFuturasProps) {
  const subtotalPagina = useMemo(() => {
    return resultados.reduce((acc, r) => acc + (Number(r.cuentaProyecto) || 0), 0);
  }, [resultados]);

  if (totalResultados === 0) {
    return (
      <div
        className="rounded-[20px] border border-[#eaecf0] bg-white py-10 text-center"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-[#344054]">
          No hay registros{departamentoActivo ? ` en ${departamentoActivo}` : ''}.
        </p>
        <p className="mt-1 text-sm text-[#667085]">
          Prueba seleccionando otro departamento en el mapa o lista.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[#667085]" aria-live="polite">
        {totalResultados === 1 ? '1 sector encontrado' : `${totalResultados} sectores encontrados`}
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
                Sector
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Cuenta de Proyecto
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                % Part
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecf0]">
            {resultados.map((item) => {
              const porcentaje =
                totalCuentaProyectos > 0
                  ? ((Number(item.cuentaProyecto) || 0) / totalCuentaProyectos) * 100
                  : 0;

              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[#f8f9fa]"
                >
                  <td className="px-4 py-3.5 font-medium text-[#001631]">
                    {item.sector}
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium tabular-nums text-[#344054]">
                    {(Number(item.cuentaProyecto) || 0).toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-[#39a900]">
                    {porcentaje.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>

          {mostrarTotales && (
            <tfoot className="border-t-2 border-[#d0d5dd] bg-[#f8f9fa]">
              {totalPaginas > 1 && (
                <tr className="border-b border-[#eaecf0] text-xs text-[#475467]">
                  <td className="px-4 py-2 text-left font-medium">
                    Subtotal esta página ({resultados.length} registros)
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold text-[#344054]">
                    {subtotalPagina.toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold text-[#39a900]">
                    {totalCuentaProyectos > 0
                      ? ((subtotalPagina / totalCuentaProyectos) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </td>
                </tr>
              )}
              <tr className="bg-[#f0f4f8]">
                <td className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#001631]">
                  Total general {totalPaginas > 1 ? `(${totalResultados.toLocaleString('es-CO')} registros)` : ''}
                </td>
                <td className="px-4 py-3.5 text-right font-bold tabular-nums text-sm text-[#001631]">
                  {totalCuentaProyectos.toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3.5 text-right font-bold tabular-nums text-sm text-[#39a900]">
                  100.0%
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <Paginador
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        onCambiarPagina={onCambiarPagina}
      />
    </div>
  );
}
