'use client';

import { Paginador } from './paginador';
import type { RegistroConDepartamento } from '../types';

interface ResultadosProgramasSobresalientesProps {
  /** Solo las filas de la página actual. */
  resultados: RegistroConDepartamento[];
  /** Total de filas que cumplen los filtros, sin recortar por página. */
  totalResultados: number;
  /** Nombre del departamento activo, o `null` si el filtro está en "Todos los departamentos". */
  departamentoActivo: string | null;
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
}

const ETIQUETA_SEXO: Record<string, string> = { M: 'Masculino', F: 'Femenino' };

const FORMATO_MONEDA = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/**
 * Resultados de la consulta: tabla de `formacion_indicadores` que cumple los
 * filtros activos (departamento, centro, formación académica, género y
 * programa), debajo del mapa y del buscador. Paginada para no obligar a
 * hacer scroll por decenas de filas.
 */
export function ResultadosProgramasSobresalientes({
  resultados,
  totalResultados,
  departamentoActivo,
  pagina,
  totalPaginas,
  onCambiarPagina,
}: ResultadosProgramasSobresalientesProps) {
  if (totalResultados === 0) {
    return (
      <div className="rounded-[20px] border border-[#eaecf0] bg-white py-10 text-center" aria-live="polite">
        <p className="text-sm font-medium text-[#344054]">
          No hay registros{departamentoActivo ? ` en ${departamentoActivo}` : ' para este filtro'}.
        </p>
        <p className="mt-1 text-sm text-[#667085]">Prueba con otro departamento, centro, formación o programa.</p>
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

      <div className="overflow-x-auto rounded-[16px] border border-[#eaecf0]">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[#f8f9fa]">
              <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Centro
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Formación Académica
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Programa
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Género
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Certificados
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Vinculados
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Tasa de Vinculación
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Salario Promedio
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecf0]">
            {resultados.map((registro) => (
              <tr key={registro.id} className="transition-colors hover:bg-[#f8f9fa]">
                <td className="px-3 py-3 text-[#344054]">
                  {registro.centro}
                  {!departamentoActivo && (
                    <span className="mt-0.5 block text-xs font-normal text-[#98a2b3]">{registro.departamento}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-[#344054]">{registro.nivelFormacion}</td>
                <td className="px-3 py-3 font-medium text-[#344054]">{registro.programa}</td>
                <td className="px-3 py-3 text-[#344054] whitespace-nowrap">
                  {ETIQUETA_SEXO[registro.sexo] ?? registro.sexo}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[#344054]">
                  {registro.certificados.toLocaleString('es-CO')}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[#344054]">
                  {registro.vinculados.toLocaleString('es-CO')}
                </td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-[#7DB828] whitespace-nowrap">
                  {registro.tasaVinculacion.toFixed(1)}%
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[#344054] whitespace-nowrap">
                  {FORMATO_MONEDA.format(registro.salarioPromedio)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <Paginador paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={onCambiarPagina} />
      )}
    </div>
  );
}
