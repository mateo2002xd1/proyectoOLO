'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, TreeChart } from 'echarts/charts';
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption, TreeSeriesOption } from 'echarts/charts';
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
  // El árbol de «Páginas publicadas» del dashboard (`tarjeta-paginas-publicadas.tsx`).
  TreeChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

export type OpcionGrafico = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | TreeSeriesOption
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
  onClickElemento,
}: {
  option: OpcionGrafico;
  className?: string;
  alto?: number | string;
  /**
   * Clic en una barra/porción: recibe su índice en `series[0].data`. Con varias series, o
   * en un árbol (donde el índice es el del recorrido de nodos), el segundo argumento dice
   * de qué serie es y trae el elemento de `data` tal cual se pasó, con sus campos propios.
   */
  onClickElemento?: (indice: number, elemento: { serie: number; datos: unknown }) => void;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  // Siempre el último manejador, sin tener que re-crear el chart cuando cambia.
  const onClickRef = useRef(onClickElemento);
  useEffect(() => {
    onClickRef.current = onClickElemento;
  }, [onClickElemento]);

  useEffect(() => {
    if (!contenedorRef.current) return;
    const chart = echarts.init(contenedorRef.current);
    chartRef.current = chart;
    chart.on('click', (evento) => {
      if (typeof evento.dataIndex === 'number') {
        onClickRef.current?.(evento.dataIndex, { serie: evento.seriesIndex ?? 0, datos: evento.data });
      }
    });

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(contenedorRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  // Antes que la opción: si el alto cambia a la vez (el árbol que se despliega), la
  // opción nueva se reparte ya en el alto nuevo. ECharts guarda el tamaño de cuando lo
  // midió y el `ResizeObserver` avisa tarde: sin esto se dibujaba en el alto viejo y
  // saltaba un instante después.
  useEffect(() => {
    chartRef.current?.resize();
  }, [alto]);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  // `contain: inline-size`: el ancho del lienzo no cuenta para el del contenedor. ECharts le
  // pone al lienzo su ancho en píxeles, y en la rejilla del dashboard la tarjeta no podía
  // ser más estrecha que él: al achicar la ventana se quedaba ancha, se salía de la
  // pantalla y el `ResizeObserver` nunca veía el cambio (2026-10-10).
  return (
    <div ref={contenedorRef} className={className} style={{ width: '100%', height: alto, contain: 'inline-size' }} />
  );
}
