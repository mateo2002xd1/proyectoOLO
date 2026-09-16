'use client';

import { useId, useState } from 'react';
import { DEPARTAMENTOS_COLOMBIA, VIEWBOX_COLOMBIA } from '../lib/departamentos-colombia';

interface MapaDepartamentosProps {
  /** Códigos DANE de los departamentos con al menos un registro de formación. */
  codigosConDatos: Set<string>;
  /** Código DANE elegido en el filtro, o `'todos'`. */
  codigoSeleccionado: string;
  onSeleccionar: (codigoDane: string) => void;
}

/** Verde institucional: departamento con programas registrados. */
const COLOR_CON_DATOS = '#7DB828';
/** Azul de marca: resto del territorio, sin datos para esta consulta. */
const COLOR_SIN_DATOS = '#001631';

/**
 * Mapa de Colombia por departamentos, coloreado según si hay programas
 * sobresalientes registrados (RF-08: la idea es que este mapa alimente más
 * adelante un contenedor de analítica del CMS; hoy consulta el fixture local).
 *
 * Cada departamento es un `<path>` con `role="button"`: se puede seleccionar
 * con clic o con teclado, igual que si se eligiera desde el select de
 * departamento —de hecho comparten el mismo estado en el hook—.
 */
export function MapaDepartamentos({
  codigosConDatos,
  codigoSeleccionado,
  onSeleccionar,
}: MapaDepartamentosProps) {
  const [enFoco, setEnFoco] = useState<string | null>(null);
  const tituloId = useId();

  const departamentoActivo = DEPARTAMENTOS_COLOMBIA.find((d) => d.codigoDane === enFoco);

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#eaecf0] bg-[#f8f9fa] p-4 sm:p-6">
      <svg
        role="group"
        aria-labelledby={tituloId}
        viewBox={VIEWBOX_COLOMBIA}
        className="mx-auto h-auto w-full max-w-[640px]"
      >
        <title id={tituloId}>Mapa de Colombia por departamento</title>
        {DEPARTAMENTOS_COLOMBIA.map((departamento) => {
          const tieneDatos = codigosConDatos.has(departamento.codigoDane);
          const estaSeleccionado = codigoSeleccionado === departamento.codigoDane;
          const deshabilitado = !tieneDatos;

          return (
            <path
              key={departamento.codigoDane}
              d={departamento.path}
              role="button"
              tabIndex={deshabilitado ? -1 : 0}
              aria-disabled={deshabilitado}
              aria-pressed={estaSeleccionado}
              aria-label={
                tieneDatos
                  ? `Ver registros de formación de ${departamento.nombre}`
                  : `${departamento.nombre}, sin registros de formación`
              }
              onClick={() => tieneDatos && onSeleccionar(estaSeleccionado ? 'todos' : departamento.codigoDane)}
              onKeyDown={(event) => {
                if (!tieneDatos) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSeleccionar(estaSeleccionado ? 'todos' : departamento.codigoDane);
                }
              }}
              onMouseEnter={() => setEnFoco(departamento.codigoDane)}
              onMouseLeave={() => setEnFoco((actual) => (actual === departamento.codigoDane ? null : actual))}
              onFocus={() => setEnFoco(departamento.codigoDane)}
              onBlur={() => setEnFoco((actual) => (actual === departamento.codigoDane ? null : actual))}
              fill={tieneDatos ? COLOR_CON_DATOS : COLOR_SIN_DATOS}
              fillOpacity={tieneDatos && codigoSeleccionado !== 'todos' && !estaSeleccionado ? 0.45 : 1}
              stroke="#ffffff"
              strokeWidth={estaSeleccionado ? 2.5 : 1}
              className={
                tieneDatos
                  ? 'cursor-pointer transition-[fill-opacity,stroke-width] duration-150 outline-none focus-visible:stroke-[#7DB828]'
                  : 'cursor-default'
              }
            />
          );
        })}
      </svg>

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
