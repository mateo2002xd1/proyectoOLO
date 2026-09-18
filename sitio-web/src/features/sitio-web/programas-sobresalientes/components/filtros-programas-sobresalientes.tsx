'use client';

import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import type { DepartamentoConDatos, FiltrosFormacion } from '../types';

/** Etiquetas de presentación para el `CHECK` de sexo del esquema real. */
const ETIQUETA_SEXO: Record<string, string> = { M: 'Masculino', F: 'Femenino' };

interface FiltrosProgramasSobresalientesProps {
  filtros: FiltrosFormacion;
  departamentosDisponibles: DepartamentoConDatos[];
  nivelesDisponibles: string[];
  sexos: string[];
  programasDisponibles: string[];
  modoSeleccionDepartamento?: 'lista' | 'mapa';
  onCambiarModoSeleccion?: (modo: 'lista' | 'mapa') => void;
  onSeleccionarDepartamento: (codigoDane: string) => void;
  onSeleccionarNivelFormacion: (nivelFormacion: string) => void;
  onSeleccionarSexo: (sexo: string) => void;
  onSeleccionarPrograma: (programa: string) => void;
  onLimpiarFiltros?: () => void;
  hayFiltrosActivos?: boolean;
}

/**
 * Barra de filtros de consulta: Selector de modo (Lista/Mapa) + Departamento (en modo lista) + Modalidad + Género + Programa.
 */
export function FiltrosProgramasSobresalientes({
  filtros,
  departamentosDisponibles,
  nivelesDisponibles,
  sexos,
  programasDisponibles,
  modoSeleccionDepartamento = 'mapa',
  onCambiarModoSeleccion,
  onSeleccionarDepartamento,
  onSeleccionarNivelFormacion,
  onSeleccionarSexo,
  onSeleccionarPrograma,
  onLimpiarFiltros,
  hayFiltrosActivos = false,
}: FiltrosProgramasSobresalientesProps) {
  const opcionesDepartamento = [
    { value: 'todos', label: 'Nacional' },
    ...departamentosDisponibles.map((depto) => ({
      value: depto.codigoDane,
      label: depto.nombre,
    })),
  ];

  const opcionesNivel = [
    { value: 'todos', label: 'Modalidad' },
    ...nivelesDisponibles.map((nivel) => ({ value: nivel, label: nivel })),
  ];

  const opcionesSexo = [
    { value: 'todos', label: 'Género' },
    ...sexos.map((sexo) => ({ value: sexo, label: ETIQUETA_SEXO[sexo] ?? sexo })),
  ];

  const opcionesPrograma = [
    { value: 'todos', label: 'Programa' },
    ...programasDisponibles.map((programa) => ({ value: programa, label: programa })),
  ];

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[#eaecf0] bg-white p-4 shadow-sm">
      {/* Selector de modo: Por lista vs Por mapa */}
      {onCambiarModoSeleccion && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eaecf0] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#344054]">
              Seleccionar departamento por:
            </span>
            <div className="inline-flex rounded-xl bg-[#f2f4f7] p-1 text-xs">
              <button
                type="button"
                onClick={() => onCambiarModoSeleccion('lista')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition ${
                  modoSeleccionDepartamento === 'lista'
                    ? 'bg-white text-[#002237] shadow-sm font-semibold'
                    : 'text-[#667085] hover:text-[#344054]'
                }`}
                aria-pressed={modoSeleccionDepartamento === 'lista'}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Lista
              </button>
              <button
                type="button"
                onClick={() => onCambiarModoSeleccion('mapa')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition ${
                  modoSeleccionDepartamento === 'mapa'
                    ? 'bg-white text-[#002237] shadow-sm font-semibold'
                    : 'text-[#667085] hover:text-[#344054]'
                }`}
                aria-pressed={modoSeleccionDepartamento === 'mapa'}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Mapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fila de controles de filtro */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        {/* Selector de departamento exclusivo del modo lista */}
        {modoSeleccionDepartamento === 'lista' && (
          <CustomSelect
            value={filtros.codigoDane}
            onChange={onSeleccionarDepartamento}
            options={opcionesDepartamento}
            ariaLabel="Filtrar por departamento"
            className="sm:w-56"
          />
        )}

        <CustomSelect
          value={filtros.nivelFormacion}
          onChange={onSeleccionarNivelFormacion}
          options={opcionesNivel}
          ariaLabel="Filtrar por modalidad"
          className="sm:w-56"
        />

        <CustomSelect
          value={filtros.sexo}
          onChange={onSeleccionarSexo}
          options={opcionesSexo}
          ariaLabel="Filtrar por género"
          className="sm:w-44"
        />

        <CustomSelect
          value={filtros.programa}
          onChange={onSeleccionarPrograma}
          options={opcionesPrograma}
          ariaLabel="Filtrar por programa"
          className="sm:w-64"
        />

        {hayFiltrosActivos && onLimpiarFiltros && (
          <button
            type="button"
            onClick={onLimpiarFiltros}
            className="text-xs font-semibold text-[#0033a0] hover:underline sm:ml-auto"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
