'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts';
import type {
  TooltipComponentOption,
  GridComponentOption,
  LegendComponentOption,
} from 'echarts/components';

// Solo se registran los charts y componentes que el panel usa: import selectivo
// de `echarts/core` en vez de `echarts` completo para no cargar mapas, radares
// ni el resto de tipos de gráfico que este proyecto nunca dibuja.
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

export type OpcionGrafico = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
>;

function suscribirTema(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
const fotoOscuro = () => document.documentElement.classList.contains('dark');
const fotoOscuroServidor = () => false;

/** Mismo mecanismo que `ThemeToggle`: los colores de ECharts no son CSS, así que
 *  hay que enterarse del cambio de tema para volver a pintar la opción a mano. */
export function useEsOscuro() {
  return useSyncExternalStore(suscribirTema, fotoOscuro, fotoOscuroServidor);
}

/**
 * Envoltorio de ECharts para el panel: crea la instancia sobre un div, la
 * redimensiona con su contenedor (`ResizeObserver`, no la ventana: estos
 * gráficos viven dentro de tarjetas y modales que cambian de tamaño solos) y
 * la destruye al desmontar.
 */
export function GraficoEcharts({
  option,
  className,
  alto = 240,
}: {
  option: OpcionGrafico;
  className?: string;
  alto?: number | string;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!contenedorRef.current) return;
    const chart = echarts.init(contenedorRef.current);
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(contenedorRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={contenedorRef} className={className} style={{ width: '100%', height: alto }} />;
}
