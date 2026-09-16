'use client';

import { useRef } from 'react';
import { useCargasProgramaSobresalientes } from '../hooks/use-cargas-programa-sobresalientes';
import { HistorialCargasGrid } from './historial-cargas-grid';
import type { CargaDatos } from '../types';

/** Etiqueta de la fase actual — 60% es donde `importarProgramasExcel` pasa de
 * leer el Excel a escribir en la base (ver `ProgresoImportacion` en el backend). */
const etiquetaFase = (progreso: number) => (progreso < 60 ? 'Leyendo el archivo' : 'Guardando en la base de datos');

/**
 * Progreso real (no simulado) de la carga en curso: el worker de `heavy-jobs`
 * escribe `progreso`/`filasProcesadas`/`filasTotales` en `cargas_datos` a medida
 * que avanza, y el sondeo de `useCargasProgramaSobresalientes` los trae aquí.
 */
function BarraDeProgreso({ carga }: { carga: CargaDatos }) {
  const porcentaje = Math.min(100, Math.max(0, carga.progreso));

  return (
    <div className="mt-3 w-full max-w-sm" aria-live="polite">
      <div className="flex items-baseline justify-between text-xs text-gray-500">
        <span>{etiquetaFase(porcentaje)}</span>
        <span className="font-medium text-[#001631]">{porcentaje}%</span>
      </div>
      <div
        className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand-interactive transition-[width] duration-300 ease-out"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      {carga.filasTotales !== null && (
        <p className="mt-1 text-xs text-gray-500">
          {carga.filasProcesadas.toLocaleString('es-CO')} de {carga.filasTotales.toLocaleString('es-CO')} filas
        </p>
      )}
    </div>
  );
}

interface CargaProgramaSobresalientesProps {
  /** Solo Administrador/Superadmin puede subir — el resto ve el historial nada más. */
  puedeActualizar: boolean;
}

/**
 * Tarjeta "Programa + Sobresalientes" de "Actualizaciones": el Administrador sube
 * el Excel de SENA y la base de datos se actualiza de inmediato, sin paso de
 * aprobación (decisión de sesión — se descartó el flujo editor-sube/admin-aprueba).
 */
export function CargaProgramaSobresalientes({ puedeActualizar }: CargaProgramaSobresalientesProps) {
  const { cargas, cargando, subiendo, error, subirArchivo, cargaEnProceso, eliminarCarga } =
    useCargasProgramaSobresalientes();
  const inputRef = useRef<HTMLInputElement>(null);
  const procesando = subiendo || cargaEnProceso !== null;

  const alElegirArchivo = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    await subirArchivo(archivo);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:translate-x-1 hover:border-gray-300 hover:shadow-md">
      <h2 className="font-semibold text-[#001631]">Programa + Sobresalientes</h2>
      <p className="mt-1 text-sm text-gray-500">
        Sube la hoja "Superan el margen" del Excel de SENA para actualizar el mapa de
        formación por departamento.
      </p>

      {puedeActualizar ? (
        <div className="mt-4">
          <label
            className={`inline-block rounded-md px-4 py-2 text-sm font-medium text-white ${
              procesando
                ? 'cursor-not-allowed bg-brand-interactive/60'
                : 'cursor-pointer bg-brand-interactive hover:bg-brand-interactive-hover'
            }`}
          >
            {subiendo ? 'Subiendo...' : cargaEnProceso ? 'Procesando...' : 'Cargar archivo Excel'}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              onChange={alElegirArchivo}
              disabled={procesando}
              className="hidden"
            />
          </label>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {cargaEnProceso && <BarraDeProgreso carga={cargaEnProceso} />}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          Solo un Administrador puede cargar este archivo.
        </p>
      )}

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-medium text-gray-700">Historial de cargas</h3>
        {cargando ? (
          <p className="text-sm text-gray-500">Cargando historial...</p>
        ) : (
          <HistorialCargasGrid cargas={cargas} onEliminar={puedeActualizar ? eliminarCarga : undefined} />
        )}
      </div>
    </div>
  );
}
