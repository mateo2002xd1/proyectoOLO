'use client';

import { useEffect, useId, useMemo, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LinesChart, MapChart, ScatterChart } from 'echarts/charts';
import { GeoComponent } from 'echarts/components';
import { GraficoEcharts } from '@/shared/ui/molecules/grafico-echarts';
import {
  ESCALA_DE_TASA,
  NOMBRE_DEL_MAPA,
  opcionMapaDepartamentos,
  svgDelMapa,
} from '../lib/opcion-mapa-departamentos';
import type { DepartamentoConDatos } from '../types';

// Solo lo que el mapa usa, además de lo que ya registra `GraficoEcharts`.
echarts.use([MapChart, LinesChart, ScatterChart, GeoComponent]);
// Solo en el navegador: el servidor no dibuja el lienzo y el SVG se lee con `DOMParser`.
if (typeof window !== 'undefined') echarts.registerMap(NOMBRE_DEL_MAPA, { svg: svgDelMapa() });

interface MapaDepartamentosProps {
  /** Departamentos con al menos un registro de formación, con la tasa que los colorea. */
  departamentos: DepartamentoConDatos[];
  /** Código DANE elegido en el filtro, o `'todos'`. */
  codigoSeleccionado: string;
  onSeleccionar: (codigoDane: string) => void;
}

const COLOR_SIN_DATOS = '#E4E7EC';

/**
 * Mapa de Colombia por departamentos (ECharts), coloreado por la tasa de vinculación de los
 * programas sobresalientes registrados, con los cuatro departamentos de mayor tasa señalados
 * con una línea guía hacia su cifra (RF-08: la idea es que este mapa alimente más adelante un
 * contenedor de analítica del CMS).
 *
 * Al pasar el cursor, el departamento se resalta y un globo dice su tasa y sus egresados. Un
 * clic lo elige y filtra la tabla, igual que el select de departamento —comparten el mismo
 * estado en el hook—; un segundo clic lo suelta.
 *
 * El lienzo no se recorre con el teclado, así que debajo hay una lista de botones, uno por
 * departamento con registros, que solo se ve al enfocarla (lectores de pantalla y teclado).
 */
export function MapaDepartamentos({
  departamentos,
  codigoSeleccionado,
  onSeleccionar,
}: MapaDepartamentosProps) {
  const tituloId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  // Permite interactuar con el mapa dentro del editor Puck sin disparar el drag and drop del bloque
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener('pointerdown', stop, { capture: true });
    return () => {
      el.removeEventListener('pointerdown', stop, { capture: true });
    };
  }, []);

  const opcion = useMemo(
    () => opcionMapaDepartamentos({ departamentos, codigoSeleccionado }),
    [departamentos, codigoSeleccionado],
  );
  const codigosConDatos = useMemo(() => new Set(departamentos.map((d) => d.codigoDane)), [departamentos]);

  const alternar = (codigoDane: string) =>
    onSeleccionar(codigoSeleccionado === codigoDane ? 'todos' : codigoDane);

  return (
    <div
      ref={containerRef}
      data-mapa-interactivo="true"
      data-puck-overlay-portal="true"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="relative overflow-hidden rounded-[20px] border border-[#eaecf0] bg-[#f8f9fa] p-4 sm:p-6"
    >
      <div
        role="img"
        aria-labelledby={tituloId}
        className="relative mx-auto aspect-[10/7] w-full max-w-[720px]"
      >
        <span id={tituloId} className="sr-only">
          Mapa de Colombia por departamento, coloreado por la tasa de vinculación de los programas sobresalientes
        </span>
        <div className="absolute inset-0">
          <GraficoEcharts
            option={opcion}
            alto="100%"
            onClickElemento={(_indice, { datos }) => {
              const codigo = (datos as { name?: string } | undefined)?.name;
              if (codigo && codigosConDatos.has(codigo)) alternar(codigo);
            }}
          />
        </div>
      </div>

      <div className="mx-auto mt-3 flex max-w-[720px] flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#667085]">
        <span className="inline-flex items-center gap-2">
          Menor tasa
          <span aria-hidden className="inline-flex overflow-hidden rounded-full">
            {ESCALA_DE_TASA.map((color) => (
              <span key={color} className="h-2.5 w-6" style={{ backgroundColor: color }} />
            ))}
          </span>
          Mayor tasa
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLOR_SIN_DATOS }} />
          Sin registros
        </span>
      </div>

      <div
        role="group"
        aria-label="Elegir un departamento con registros de formación"
        className="not-focus-within:sr-only mx-auto mt-3 flex max-w-[720px] flex-wrap justify-center gap-1.5"
      >
        {departamentos.map((departamento) => {
          const elegido = codigoSeleccionado === departamento.codigoDane;
          return (
            <button
              key={departamento.codigoDane}
              type="button"
              aria-pressed={elegido}
              onClick={() => alternar(departamento.codigoDane)}
              className={`rounded-full border px-3 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#001631] ${
                elegido
                  ? 'border-[#001631] bg-[#001631] text-white'
                  : 'border-[#d0d5dd] bg-white text-[#344054]'
              }`}
            >
              {departamento.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
