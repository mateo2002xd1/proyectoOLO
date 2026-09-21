'use client';

import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import type { FiltrosTendencia } from '../types';

interface FiltrosTendenciaProps {
  filtros: FiltrosTendencia;
  departamentosDisponibles: string[];
  aniosDisponibles: number[];
  periodosDisponibles: string[];
  nivelesDisponibles: string[];
  modoSeleccionDepartamento?: 'lista' | 'mapa';
  onCambiarModoSeleccion?: (modo: 'lista' | 'mapa') => void;
  onSeleccionarDepartamento: (depto: string) => void;
  onSeleccionarAnio: (anio: string) => void;
  onSeleccionarPeriodo: (periodo: string) => void;
  onSeleccionarNivel: (nivel: string) => void;
  onLimpiarFiltros?: () => void;
  hayFiltrosActivos?: boolean;
}

export function FiltrosTendencia({
  filtros,
  departamentosDisponibles,
  aniosDisponibles,
  periodosDisponibles,
  nivelesDisponibles,
  modoSeleccionDepartamento = 'lista',
  onCambiarModoSeleccion,
  onSeleccionarDepartamento,
  onSeleccionarAnio,
  onSeleccionarPeriodo,
  onSeleccionarNivel,
  onLimpiarFiltros,
  hayFiltrosActivos = false,
}: FiltrosTendenciaProps) {
  const opcionesDepartamento = [
    { value: 'Nacional', label: 'Nacional' },
    ...departamentosDisponibles
      .filter((depto) => depto.toLowerCase() !== 'nacional')
      .map((depto) => ({ value: depto, label: depto })),
  ];

  const opcionesAnio = [
    { value: 'todos', label: 'Año' },
    ...aniosDisponibles.map((a) => ({ value: String(a), label: String(a) })),
  ];

  const opcionesPeriodo = [
    { value: 'todos', label: 'Periodo' },
    ...periodosDisponibles.map((p) => ({ value: p, label: p })),
  ];

  const opcionesNivel = [
    { value: 'todos', label: 'Nivel Ocupacional' },
    ...nivelesDisponibles.map((n) => ({ value: n, label: n })),
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
        {modoSeleccionDepartamento === 'lista' && (
          <CustomSelect
            value={filtros.departamento}
            onChange={onSeleccionarDepartamento}
            options={opcionesDepartamento}
            ariaLabel="Filtrar por departamento"
            className="sm:w-56"
          />
        )}

        <CustomSelect
          value={filtros.anio}
          onChange={onSeleccionarAnio}
          options={opcionesAnio}
          ariaLabel="Filtrar por año"
          className="sm:w-36"
        />

        <CustomSelect
          value={filtros.periodo}
          onChange={onSeleccionarPeriodo}
          options={opcionesPeriodo}
          ariaLabel="Filtrar por periodo"
          className="sm:w-48"
        />

        <CustomSelect
          value={filtros.nivelOcupacional}
          onChange={onSeleccionarNivel}
          options={opcionesNivel}
          ariaLabel="Filtrar por nivel ocupacional"
          className="sm:w-64"
        />

        {hayFiltrosActivos && onLimpiarFiltros && (
          <button
            type="button"
            onClick={onLimpiarFiltros}
            className="inline-flex h-11 items-center justify-center rounded-[16px] border border-[#eaecf0] bg-white px-4 text-xs font-semibold tracking-wide text-[#344054] transition hover:bg-[#f8f9fa] hover:text-[#002237] focus:outline-none focus:ring-2 focus:ring-[#002237]/10"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
