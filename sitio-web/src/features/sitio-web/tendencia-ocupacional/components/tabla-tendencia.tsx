'use client';

import { Paginador } from './paginador';
import type { RegistroTendenciaOcupacional } from '../types';

interface TablaTendenciaProps {
  resultados: RegistroTendenciaOcupacional[];
  totalResultados: number;
  departamentoActivo: string | null;
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
}

export function TablaTendencia({
  resultados,
  totalResultados,
  departamentoActivo,
  pagina,
  totalPaginas,
  onCambiarPagina,
}: TablaTendenciaProps) {
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

      <div className="overflow-x-auto rounded-[16px] border border-[#eaecf0] bg-white">
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
                key={registro.id}
                className="transition-colors hover:bg-[#f8f9fa]"
              >
                <td className="px-4 py-3.5 font-medium text-[#344054]">
                  {registro.nivelCodigo}
                </td>
                <td className="px-4 py-3.5 tabular-nums text-[#667085]">
                  {registro.codigoCno}
                </td>
                <td className="px-4 py-3.5 font-medium text-[#001631]">
                  {registro.nombreOcupacion}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-[#344054]">
                  {registro.totalInscritos.toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-[#39a900]">
                  {registro.totalVacantes.toLocaleString('es-CO')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <Paginador
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          onCambiarPagina={onCambiarPagina}
        />
      )}
    </div>
  );
}
