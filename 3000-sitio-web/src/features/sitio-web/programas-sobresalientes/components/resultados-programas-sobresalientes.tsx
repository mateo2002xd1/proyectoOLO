'use client';

import { Paginador } from '@/shared/ui/molecules/paginador';
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
  porPagina: number;
  onCambiarPorPagina: (porPagina: number) => void;
}

const ETIQUETA_SEXO: Record<string, string> = { M: 'Masculino', F: 'Femenino' };

const FORMATO_MONEDA = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/**
 * Resultados de la consulta: las filas de `programas_sobresalientes` que cumplen
 * los filtros activos (departamento, modalidad, género y programa). Paginada para
 * no obligar a hacer scroll por decenas de filas.
 *
 * Los encabezados usan el vocabulario del observatorio, no el del Excel de SENA:
 *
 * | Encabezado             | Campo              | Columna del Excel      |
 * |------------------------|--------------------|------------------------|
 * | Modalidad              | `nivelFormacion`   | Nivel de Formación     |
 * | Egresados              | `certificados`     | Certificados           |
 * | Vinculación %          | `tasaVinculacion`  | Tasa de vinculación    |
 * | Promedio de Salario $  | `salarioPromedio`  | Salario promedio       |
 *
 * Los campos conservan el nombre del Excel a propósito: así el importador lo lee
 * uno a uno y nadie tiene que recordar una traducción al subir el archivo. La
 * traducción vive solo aquí, en la presentación.
 *
 * `vinculados` llega en cada fila pero no se muestra: la vinculación ya se lee en
 * porcentaje, y la tasa se calcula a partir de ese dato al importar, así que se
 * sigue guardando.
 */
export function ResultadosProgramasSobresalientes({
  resultados,
  totalResultados,
  departamentoActivo,
  pagina,
  totalPaginas,
  onCambiarPagina,
  porPagina,
  onCambiarPorPagina,
}: ResultadosProgramasSobresalientesProps) {
  if (totalResultados === 0) {
    return (
      <div className="rounded-[20px] border border-[#eaecf0] bg-white py-10 text-center" aria-live="polite">
        <p className="text-sm font-medium text-[#344054]">
          No hay registros{departamentoActivo ? ` en ${departamentoActivo}` : ' para este filtro'}.
        </p>
        <p className="mt-1 text-sm text-[#667085]">Prueba con otro departamento, modalidad, género o programa.</p>
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
        <table className="olo-tabla-apilable w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[#f8f9fa]">
              <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Departamento
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Centro
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Modalidad
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Programa
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Género
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                Egresados
              </th>
              {/* Espacio duro (` `) entre la palabra y la unidad: los encabezados
                  pueden partirse en dos líneas —así la tabla no se ensancha—, pero el
                  «%» o el «$» solos en una línea no se leen como parte del título. */}
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                {'Vinculación %'}
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
                {'Promedio de Salario $'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecf0]">
            {resultados.map((registro) => (
              <tr key={registro.id} className="transition-colors hover:bg-[#f8f9fa]">
                <td data-etiqueta="Departamento" className="px-3 py-3 text-[#344054]">{registro.departamento}</td>
                <td data-etiqueta="Centro" className="px-3 py-3 text-[#344054]">{registro.centro}</td>
                <td data-etiqueta="Modalidad" className="px-3 py-3 text-[#344054]">{registro.nivelFormacion}</td>
                {/* En el móvil la fila pasa a tarjeta y el programa la encabeza (`data-titulo`). */}
                <td data-titulo className="px-3 py-3 font-medium text-[#344054]">{registro.programa}</td>
                <td data-etiqueta="Género" className="px-3 py-3 text-[#344054] whitespace-nowrap">
                  {ETIQUETA_SEXO[registro.sexo] ?? registro.sexo}
                </td>
                <td data-etiqueta="Egresados" className="px-3 py-3 text-right tabular-nums text-[#344054]">
                  {registro.certificados.toLocaleString('es-CO')}
                </td>
                <td data-etiqueta="Vinculación %" className="px-3 py-3 text-right font-semibold tabular-nums text-[#7DB828] whitespace-nowrap">
                  {registro.tasaVinculacion.toFixed(1)}%
                </td>
                <td data-etiqueta="Salario promedio" className="px-3 py-3 text-right tabular-nums text-[#344054] whitespace-nowrap">
                  {FORMATO_MONEDA.format(registro.salarioPromedio)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <Paginador
          pagina={pagina}
          totalPaginas={totalPaginas}
          onCambiarPagina={onCambiarPagina}
          total={totalResultados}
          porPagina={porPagina}
          onCambiarPorPagina={onCambiarPorPagina}
          etiqueta="programas"
          tono="publico"
          className="mt-4"
        />
      )}
    </div>
  );
}
