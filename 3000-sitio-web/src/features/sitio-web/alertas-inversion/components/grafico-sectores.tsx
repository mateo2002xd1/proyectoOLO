'use client';

import { useEffect, useRef } from 'react';
import type { SeccionConCantidad } from '../types';

interface GraficoSectoresProps {
  datos: SeccionConCantidad[];
  seccionSeleccionada: string;
  onSeleccionar: (letra: string) => void;
}

/**
 * Barras horizontales de "proyectos de inversión por sector CIIU" — `echarts` va
 * directo (sin `echarts-for-react`, que no está entre las dependencias del sitio):
 * un `useEffect` inicializa el chart sobre un `div` y lo destruye al desmontar.
 */
export function GraficoSectores({ datos, seccionSeleccionada, onSeleccionar }: GraficoSectoresProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const instanciaRef = useRef<import('echarts').ECharts | null>(null);

  useEffect(() => {
    let cancelado = false;
    import('echarts').then((echarts) => {
      if (cancelado || !contenedorRef.current) return;
      const instancia = echarts.init(contenedorRef.current);
      instanciaRef.current = instancia;

      instancia.on('click', (evento) => {
        const letra = datos[evento.dataIndex as number]?.letra;
        if (letra) onSeleccionar(letra);
      });

      const redimensionar = () => instancia.resize();
      window.addEventListener('resize', redimensionar);
      return () => window.removeEventListener('resize', redimensionar);
    });

    return () => {
      cancelado = true;
      instanciaRef.current?.dispose();
      instanciaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const instancia = instanciaRef.current;
    if (!instancia) return;

    const ordenados = [...datos].sort((a, b) => a.cantidadProyectos - b.cantidadProyectos);

    instancia.setOption({
      grid: { left: 8, right: 24, top: 8, bottom: 8, containLabel: true },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value', minInterval: 1 },
      yAxis: {
        type: 'category',
        data: ordenados.map((s) => `${s.letra} · ${s.nombre}`),
        axisLabel: { width: 220, overflow: 'truncate' },
      },
      series: [
        {
          type: 'bar',
          data: ordenados.map((s) => ({
            value: s.cantidadProyectos,
            itemStyle: {
              color: !seccionSeleccionada || s.letra === seccionSeleccionada ? '#7db828' : '#cbd5e1',
            },
          })),
          barMaxWidth: 22,
        },
      ],
    });
  }, [datos, seccionSeleccionada]);

  if (datos.every((s) => s.cantidadProyectos === 0)) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[20px] border border-[#eaecf0] bg-[#f8f9fa] text-sm text-[#667085]">
        Todavía no hay proyectos publicados.
      </div>
    );
  }

  return <div ref={contenedorRef} className="h-[520px] w-full" role="img" aria-label="Proyectos de inversión por sector económico" />;
}
