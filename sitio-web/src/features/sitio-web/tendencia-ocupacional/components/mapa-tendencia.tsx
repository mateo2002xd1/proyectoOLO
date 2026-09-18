'use client';

import { useId, useMemo, useState } from 'react';
import {
  DEPARTAMENTOS_COLOMBIA,
  VIEWBOX_COLOMBIA,
} from '@/shared/lib/departamentos-colombia';

interface MapaTendenciaProps {
  /** Departamentos con al menos un registro en los datos actuales del bloque */
  departamentosConDatos: string[];
  /** Departamento elegido en el filtro, o 'Nacional' */
  departamentoSeleccionado: string;
  /** Callback para cambiar el departamento seleccionado */
  onSeleccionar: (departamento: string) => void;
}

/** Verde institucional: departamento con ocupaciones registradas en este bloque */
const COLOR_CON_DATOS = '#7DB828';
/** Azul de marca: resto del territorio sin datos para la consulta activa */
const COLOR_SIN_DATOS = '#001631';

function normalizar(texto: string): string {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function coinciden(nombreA: string, nombreB: string): boolean {
  const a = normalizar(nombreA);
  const b = normalizar(nombreB);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  if (
    (a.includes('bogota') && b.includes('bogota')) ||
    (a.includes('sanandres') && b.includes('sanandres'))
  ) {
    return true;
  }
  return false;
}

export function MapaTendencia({
  departamentosConDatos = [],
  departamentoSeleccionado = 'Nacional',
  onSeleccionar,
}: MapaTendenciaProps) {
  const [enFoco, setEnFoco] = useState<string | null>(null);
  const tituloId = useId();

  const esNacional =
    !departamentoSeleccionado ||
    departamentoSeleccionado.toLowerCase() === 'nacional' ||
    departamentoSeleccionado.toLowerCase() === 'todos';

  // Mapa rápido de nombres reales para conservar la capitalización original del dataset
  const deptoMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const geo of DEPARTAMENTOS_COLOMBIA) {
      const coincidencia = departamentosConDatos.find((d) => coinciden(d, geo.nombre));
      if (coincidencia) {
        map.set(geo.codigoDane, coincidencia);
      }
    }
    return map;
  }, [departamentosConDatos]);

  const departamentoActivo = DEPARTAMENTOS_COLOMBIA.find((d) => d.codigoDane === enFoco);

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#eaecf0] bg-[#f8f9fa] p-4 sm:p-6">
      {/* SVG del mapa de Colombia con los 33 departamentos */}
      <svg
        role="group"
        aria-labelledby={tituloId}
        viewBox={VIEWBOX_COLOMBIA}
        className="mx-auto h-auto w-full max-w-[640px]"
      >
        <title id={tituloId}>Mapa de Colombia para selección de departamento</title>
        {DEPARTAMENTOS_COLOMBIA.map((departamento) => {
          const tieneDatos = deptoMap.has(departamento.codigoDane);
          const nombreEnDatos = deptoMap.get(departamento.codigoDane) || departamento.nombre;
          const estaSeleccionado = !esNacional && coinciden(departamentoSeleccionado, departamento.nombre);
          const deshabilitado = !tieneDatos;

          return (
            <path
              key={departamento.codigoDane}
              d={departamento.path}
              role={tieneDatos ? 'button' : undefined}
              tabIndex={tieneDatos ? 0 : -1}
              aria-disabled={deshabilitado ? true : undefined}
              aria-pressed={tieneDatos ? estaSeleccionado : undefined}
              aria-label={
                tieneDatos
                  ? `Filtrar por ${departamento.nombre}`
                  : `${departamento.nombre}, sin registros en este cuadrante`
              }
              onClick={() => {
                if (!tieneDatos) return;
                onSeleccionar(estaSeleccionado ? 'Nacional' : nombreEnDatos);
              }}
              onKeyDown={(event) => {
                if (!tieneDatos) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSeleccionar(estaSeleccionado ? 'Nacional' : nombreEnDatos);
                }
              }}
              onMouseEnter={() => setEnFoco(departamento.codigoDane)}
              onMouseLeave={() =>
                setEnFoco((actual) => (actual === departamento.codigoDane ? null : actual))
              }
              onFocus={() => tieneDatos && setEnFoco(departamento.codigoDane)}
              onBlur={() =>
                setEnFoco((actual) => (actual === departamento.codigoDane ? null : actual))
              }
              fill={tieneDatos ? COLOR_CON_DATOS : COLOR_SIN_DATOS}
              fillOpacity={tieneDatos && !esNacional && !estaSeleccionado ? 0.45 : 1}
              stroke="#ffffff"
              strokeWidth={estaSeleccionado ? 2.5 : 1}
              className={`outline-none focus:outline-none focus-visible:outline-none ${
                tieneDatos
                  ? 'cursor-pointer transition-[fill-opacity,stroke-width] duration-150 focus-visible:stroke-[#7DB828]'
                  : 'cursor-default'
              }`}
            />
          );
        })}
      </svg>

      {/* Pill inferior de hover / foco con el nombre del departamento */}
      <div
        aria-live="polite"
        className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#001631] px-3.5 py-1.5 text-xs font-medium text-white shadow-lg transition-opacity duration-150 sm:text-sm"
        style={{ opacity: departamentoActivo ? 1 : 0 }}
      >
        {departamentoActivo?.nombre ?? ''}
      </div>
    </div>
  );
}
