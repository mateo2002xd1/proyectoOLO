'use client';

import { useState, useMemo } from 'react';
import { type ResumenPaginasPublicadas } from '@/features/paginas';
import { ModalDiagramaVisitas } from './modal-diagrama-visitas';
import { GraficoEcharts, useEsOscuro, type OpcionGrafico } from '@/shared/ui/molecules/grafico-echarts';

interface Props {
  resumen: ResumenPaginasPublicadas | null;
  error: string | null;
}

/** Trunca el título de la página para que quepa como etiqueta del eje sin
 *  aplastar el resto del gráfico; el título completo va en el tooltip. */
const acortar = (texto: string, limite = 12) =>
  texto.length > limite ? `${texto.slice(0, limite - 1)}…` : texto;

/**
 * Tarjeta de Visitas para el Dashboard.
 * Contiene 2 gráficos de líneas interactivos (Sitio Web e Intranet) con sus páginas correspondientes,
 * y se abre en grande, con métricas detalladas, al pulsar la tarjeta.
 */
export function TarjetaVisitas({ resumen, error }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState<'sitio' | 'intranet'>('sitio');

  const paginasSitio = useMemo(() => resumen?.sitio ?? [], [resumen]);
  const paginasIntranet = useMemo(() => resumen?.intranet ?? [], [resumen]);

  const totalVisitasSitio = useMemo(
    () => paginasSitio.reduce((acc, p) => acc + (p.visitas ?? 0), 0),
    [paginasSitio]
  );
  const totalVisitasIntranet = useMemo(
    () => paginasIntranet.reduce((acc, p) => acc + (p.visitas ?? 0), 0),
    [paginasIntranet]
  );
  const totalVisitas = totalVisitasSitio + totalVisitasIntranet;

  const paginasMostradas = pestanaActiva === 'sitio' ? paginasSitio : paginasIntranet;
  const esIntranet = pestanaActiva === 'intranet';
  const esOscuro = useEsOscuro();

  const opcion: OpcionGrafico = useMemo(() => {
    const colorEje = esOscuro ? '#94a3b8' : '#a1a1aa';
    const colorLinea = esIntranet ? '#0284c7' : '#4C7A1C';
    const colorAreaTope = esIntranet ? 'rgba(2,132,199,0.35)' : 'rgba(76,122,28,0.35)';
    const colorAreaFondo = esIntranet ? 'rgba(2,132,199,0)' : 'rgba(76,122,28,0)';

    return {
      grid: { left: 4, right: 8, top: 16, bottom: 22, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: esOscuro ? '#1e293b' : '#ffffff',
        borderColor: esOscuro ? '#334155' : '#e4e4e7',
        textStyle: { color: esOscuro ? '#f6f6f6' : '#18181b' },
        formatter: (parametros) => {
          const punto = Array.isArray(parametros) ? parametros[0] : parametros;
          const pagina = paginasMostradas[punto.dataIndex as number];
          const visitas = (punto.value as number).toLocaleString('es-CO');
          return `<strong>${pagina?.titulo ?? punto.name}</strong><br/>${visitas} visitas`;
        },
      },
      xAxis: {
        type: 'category',
        data: paginasMostradas.map((p) => acortar(p.titulo)),
        axisLine: { lineStyle: { color: esOscuro ? '#334155' : '#e4e4e7' } },
        axisTick: { show: false },
        axisLabel: { color: colorEje, fontSize: 10 },
      },
      yAxis: { type: 'value', show: false },
      series: [
        {
          type: 'line',
          data: paginasMostradas.map((p) => p.visitas ?? 0),
          smooth: true,
          symbolSize: 6,
          lineStyle: { width: 3, color: colorLinea },
          itemStyle: { color: colorLinea },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: colorAreaTope },
                { offset: 1, color: colorAreaFondo },
              ],
            },
          },
        },
      ],
    };
  }, [paginasMostradas, esIntranet, esOscuro]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Abrir la gráfica de visitas en grande"
        onClick={() => setModalAbierto(true)}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setModalAbierto(true);
          }
        }}
        className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155] flex flex-col justify-between">
        <div>
          {/* Encabezado con título y botón para abrir la ventana de vistas */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-[#001631] dark:text-[#94a3b8]">Visitas</p>
              {error ? (
                <p className="mt-1 text-2xl font-bold text-zinc-400 dark:text-zinc-600">—</p>
              ) : (
                <p className="mt-1 text-2xl font-bold text-[#001631] dark:text-[#f6f6f6] tabular-nums">
                  {totalVisitas.toLocaleString('es-CO')}
                </p>
              )}
            </div>
          </div>

          {error ? (
            <p className="mt-3 text-xs text-red-600 dark:text-red-300">{error}</p>
          ) : (
            <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-[#7db828]/20">
              {/* Selector de los 2 gráficos (Sitio Web e Intranet) */}
              <div className="mb-3 flex items-center justify-between gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/70">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPestanaActiva('sitio');
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium transition-colors ${
                    pestanaActiva === 'sitio'
                      ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <span className="size-2 rounded-full bg-[#4C7A1C]" />
                  <span>Sitio web</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPestanaActiva('intranet');
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium transition-colors ${
                    pestanaActiva === 'intranet'
                      ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <span className="size-2 rounded-full bg-sky-500" />
                  <span>Intranet</span>
                </button>
              </div>

              {/* Tendencia de visitas por página del ámbito seleccionado */}
              {paginasMostradas.length === 0 ? (
                <p className="py-3 text-center text-xs text-zinc-400">Sin páginas registradas</p>
              ) : (
                <GraficoEcharts option={opcion} alto={160} />
              )}
            </div>
          )}
        </div>

      </div>

      {/* Ventana modal interactiva */}
      <ModalDiagramaVisitas
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        resumen={resumen}
      />
    </>
  );
}
