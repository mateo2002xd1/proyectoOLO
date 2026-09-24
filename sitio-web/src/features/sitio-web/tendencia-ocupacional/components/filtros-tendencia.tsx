'use client';

import { Switch } from '@/shared/ui/atoms/switch';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { YearPicker } from '@/shared/ui/molecules/year-picker';

import type { FiltrosTendencia as Filtros, OpcionesTendenciaOcupacional } from '../types';

interface FiltrosTendenciaProps {
  filtros: Filtros;
  /** Catálogos de la base: nada de las listas está fijo aquí. */
  opciones: OpcionesTendenciaOcupacional;
  modoSeleccionDepartamento?: 'lista' | 'mapa';
  onCambiarModoSeleccion?: (modo: 'lista' | 'mapa') => void;
  onCambiar: (cambios: Partial<Filtros>) => void;
  onLimpiarFiltros?: () => void;
  hayFiltrosActivos?: boolean;
}

export function FiltrosTendencia({
  filtros,
  opciones,
  modoSeleccionDepartamento = 'lista',
  onCambiarModoSeleccion,
  onCambiar,
  onLimpiarFiltros,
  hayFiltrosActivos = false,
}: FiltrosTendenciaProps) {
  const opcionesDepartamento = opciones.departamentos.map((d) => ({ value: d.valor, label: d.nombre }));

  // El año se elige en el calendario, entre el primero y el último con datos publicados;
  // los años de en medio sin nada publicado se ven apagados y no se pueden elegir.
  const anioActual = new Date().getFullYear();
  const primerAnio = opciones.anios.length ? Math.min(...opciones.anios) : anioActual;
  const ultimoAnio = opciones.anios.length ? Math.max(...opciones.anios) : anioActual;

  // Los siete periodos siempre, en su orden; los que no tienen datos publicados ese año
  // se ven marcados pero no se pueden elegir (el texto lo dice: no solo el color).
  const opcionesPeriodo = opciones.periodos.map((p) => ({
    value: p.codigo,
    label: p.disponible ? p.nombre : `${p.nombre} (sin datos)`,
    disabled: !p.disponible,
  }));

  const opcionesNivel = [
    { value: '', label: 'Todos los niveles' },
    ...opciones.niveles.map((n) => ({ value: n.codigo, label: n.etiqueta })),
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
            onChange={(departamento) => onCambiar({ departamento })}
            options={opcionesDepartamento}
            ariaLabel="Filtrar por departamento"
            className="sm:w-56"
          />
        )}

        <YearPicker
          value={filtros.anio}
          onChange={(anio) => onCambiar({ anio })}
          min={primerAnio}
          max={ultimoAnio}
          disponibles={opciones.anios}
          placeholder="Año"
          ariaLabel="Filtrar por año"
          className="sm:w-36"
        />

        <CustomSelect
          value={filtros.periodo}
          onChange={(periodo) => onCambiar({ periodo })}
          options={opcionesPeriodo}
          placeholder="Periodo"
          ariaLabel="Filtrar por periodo"
          className="sm:w-56"
        />

        <CustomSelect
          value={filtros.nivelOcupacional}
          onChange={(nivelOcupacional) => onCambiar({ nivelOcupacional })}
          options={opcionesNivel}
          ariaLabel="Filtrar por nivel ocupacional"
          className="sm:w-64"
        />

        <div className="flex items-center gap-2 text-xs font-medium text-[#344054]">
          <Switch
            checked={filtros.incluirSinRegistros}
            onChange={(incluirSinRegistros) => onCambiar({ incluirSinRegistros })}
            aria-label="Incluir ocupaciones sin registros"
          />
          <span aria-hidden="true">Incluir ocupaciones sin registros</span>
        </div>

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
