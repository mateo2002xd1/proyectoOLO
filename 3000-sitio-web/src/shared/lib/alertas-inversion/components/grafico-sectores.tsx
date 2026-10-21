'use client';

import { useMemo } from 'react';
import { GraficoEcharts, type OpcionGrafico } from '@/shared/ui/molecules/grafico-echarts';
import type { SeccionConCantidad } from '../types';

interface GraficoSectoresProps {
  datos: SeccionConCantidad[];
  seccionSeleccionada: string;
  onSeleccionar: (letra: string) => void;
}

const VERDE = '#7db828';
const GRIS = '#cbd5e1';

/**
 * Barras horizontales de proyectos de inversión por sector CIIU, sobre el envoltorio
 * compartido `GraficoEcharts`; el clic en una barra filtra por ese sector. (Antes
 * cargaba `echarts` con un `import()` dinámico en un efecto y, si llegaba tarde, el
 * gráfico quedaba vacío.)
 */
export function GraficoSectores({ datos, seccionSeleccionada, onSeleccionar }: GraficoSectoresProps) {
  // De menos a más: el sector con más proyectos queda arriba.
  const ordenados = useMemo(
    () => [...datos].sort((a, b) => a.cantidadProyectos - b.cantidadProyectos),
    [datos]
  );

  const option = useMemo<OpcionGrafico>(
    () => ({
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
            itemStyle: { color: !seccionSeleccionada || s.letra === seccionSeleccionada ? VERDE : GRIS },
          })),
          barMaxWidth: 22,
        },
      ],
    }),
    [ordenados, seccionSeleccionada]
  );

  if (datos.every((s) => s.cantidadProyectos === 0)) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[20px] border border-[#eaecf0] bg-[#f8f9fa] text-sm text-[#667085]">
        Todavía no hay proyectos publicados.
      </div>
    );
  }

  return (
    <section className="rounded-[20px] border border-[#eaecf0] bg-white p-5">
      <h2 className="text-base font-semibold text-[#001631]">Proyectos por sector</h2>
      <p className="mb-2 text-sm text-[#667085]">Haga clic en un sector para filtrar el listado.</p>
      <div role="img" aria-label="Proyectos de inversión por sector económico">
        <GraficoEcharts
          option={option}
          alto={520}
          onClickElemento={(indice) => {
            const letra = ordenados[indice]?.letra;
            if (letra) onSeleccionar(letra);
          }}
        />
      </div>
    </section>
  );
}
