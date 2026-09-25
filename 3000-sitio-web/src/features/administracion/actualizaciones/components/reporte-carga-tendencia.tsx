'use client';

import type { HallazgoCarga, ReporteCargaTendencia } from '../types';

/** Filas de muestra que se enseñan por validación (la API guarda hasta 20). */
const MUESTRA_VISIBLE = 5;

/** Nombres legibles de las columnas que devuelven las validaciones del backend. */
const ETIQUETA_CAMPO: Record<string, string> = {
  fila_excel: 'fila',
  fila: 'fila',
  hoja: 'hoja',
  departamento_txt: 'departamento',
  codigo: 'código',
  codigo_nc_excel: 'N.C. del Excel',
  codigo_nc_derivado: 'N.C. según el código',
  nombres: 'nombres',
  filas: 'filas',
  ins_nacional: 'inscritos nacional',
  ins_suma_dptos: 'suma departamentos',
  vac_nacional: 'vacantes nacional',
  vac_suma_dptos: 'suma departamentos',
  pct_inscritos: 'percentil inscritos',
  pct_ins_calc: 'recalculado',
  pct_vacantes: 'percentil vacantes',
  pct_vac_calc: 'recalculado',
  criterio_excel: 'criterio en el Excel',
  criterio_formula: 'criterio por fórmula',
  nombre_actual: 'nombre actual',
  nombre_nuevo: 'nombre nuevo',
  ocupaciones: 'ocupaciones',
  esperadas: 'esperadas',
};

const HOJA: Record<string, string> = { NAC: 'nacional', DEP: 'departamental' };

/**
 * Primero lo que ubica la fila en el Excel. El reporte se guarda en JSONB, que reordena
 * las claves, así que el orden de la consulta no llega hasta aquí.
 */
const PRIMERO = ['hoja', 'fila_excel', 'fila', 'departamento_txt', 'codigo'];
const posicion = (campo: string) => {
  const i = PRIMERO.indexOf(campo);
  return i === -1 ? PRIMERO.length : i;
};

function describirFila(fila: Record<string, unknown>): string {
  if (typeof fila.mensaje === 'string') return fila.mensaje;
  return Object.entries(fila)
    .filter(([, valor]) => valor !== null && valor !== undefined && valor !== '')
    .sort(([a], [b]) => posicion(a) - posicion(b))
    .map(([campo, valor]) => {
      const texto = Array.isArray(valor)
        ? valor.join(', ')
        : campo === 'hoja'
          ? (HOJA[String(valor)] ?? String(valor))
          : typeof valor === 'number' && !Number.isInteger(valor)
            ? valor.toFixed(4)
            : String(valor);
      return `${ETIQUETA_CAMPO[campo] ?? campo}: ${texto}`;
    })
    .join(' · ');
}

function ListaDeHallazgos({ hallazgos, tipo }: { hallazgos: HallazgoCarga[]; tipo: 'error' | 'advertencia' }) {
  return (
    <ul className="space-y-2">
      {hallazgos.map((h) => (
        <li key={h.codigo}>
          <p
            className={`font-medium ${
              tipo === 'error' ? 'text-red-700 dark:text-red-300' : 'text-amber-800 dark:text-amber-200'
            }`}
          >
            {h.codigo} · {h.descripcion} ({h.total.toLocaleString('es-CO')})
          </p>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-5 text-zinc-600 dark:text-zinc-400">
            {h.muestra.slice(0, MUESTRA_VISIBLE).map((fila, i) => (
              <li key={i}>{describirFila(fila)}</li>
            ))}
            {h.total > MUESTRA_VISIBLE && (
              <li className="list-none text-zinc-500">
                y {(h.total - Math.min(h.muestra.length, MUESTRA_VISIBLE)).toLocaleString('es-CO')} más
              </li>
            )}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/**
 * Detalle de las validaciones de una carga (V1–V9): los errores que la detuvieron y
 * las advertencias con las que pasó, cada uno con unas filas de ejemplo para saber qué
 * corregir en el Excel. Plegado por defecto.
 */
export function ReporteCargaTendencia({ reporte }: { reporte: ReporteCargaTendencia | null | undefined }) {
  const errores = reporte?.errores ?? [];
  const advertencias = reporte?.advertencias ?? [];
  if (errores.length === 0 && advertencias.length === 0) return null;

  const partes = [
    errores.length > 0 && `${errores.length} ${errores.length === 1 ? 'error' : 'errores'}`,
    advertencias.length > 0 && `${advertencias.length} ${advertencias.length === 1 ? 'advertencia' : 'advertencias'}`,
  ].filter(Boolean);

  return (
    <details className="mt-1 text-xs">
      <summary className="cursor-pointer font-medium text-brand-interactive hover:underline">
        Ver reporte ({partes.join(', ')})
      </summary>
      <div className="mt-2 space-y-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/40">
        {errores.length > 0 && <ListaDeHallazgos hallazgos={errores} tipo="error" />}
        {advertencias.length > 0 && <ListaDeHallazgos hallazgos={advertencias} tipo="advertencia" />}
      </div>
    </details>
  );
}
