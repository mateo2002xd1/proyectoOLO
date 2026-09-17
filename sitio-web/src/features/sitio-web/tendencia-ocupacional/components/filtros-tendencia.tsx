'use client';

import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import type { FiltrosTendencia } from '../types';

interface FiltrosTendenciaProps {
  filtros: FiltrosTendencia;
  departamentosDisponibles: string[];
  aniosDisponibles: number[];
  periodosDisponibles: string[];
  nivelesDisponibles: string[];
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <CustomSelect
          value={filtros.departamento}
          onChange={onSeleccionarDepartamento}
          options={opcionesDepartamento}
          ariaLabel="Filtrar por departamento"
          className="sm:w-56"
        />

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
