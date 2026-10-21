'use client';

import { useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCierreAnimado } from '@/shared/lib/modals/use-cierre-animado';
import { type PaginaPublicada, type ResumenPaginasPublicadas } from '@/features/editor';
import { GraficoEcharts, useEsOscuro, type OpcionGrafico } from '@/shared/ui/molecules/grafico-echarts';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  resumen: ResumenPaginasPublicadas | null;
}

/**
 * Visitas por página de un ámbito: la misma línea con área de la tarjeta, con más detalle.
 */
/** "#rrggbb" a "rgba(r,g,b,a)" para el degradado del área. */
function hexARgba(hex: string, alfa: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alfa})`;
}

function GraficoVisitas({
  titulo,
  subtitulo,
  paginas,
  colorFin,
  colorBg,
  colorBorde,
}: {
  titulo: string;
  subtitulo: string;
  paginas: PaginaPublicada[];
  colorFin: string;
  colorBg: string;
  colorBorde: string;
}) {
  const esOscuro = useEsOscuro();

  const totalVisitas = useMemo(
    () => paginas.reduce((acc, p) => acc + (p.visitas ?? 0), 0),
    [paginas]
  );

  const opcion: OpcionGrafico = useMemo(() => {
    const colorTexto = esOscuro ? '#f6f6f6' : '#18181b';
    const colorEje = esOscuro ? '#cbd5e1' : '#52525b';
    const colorAreaTope = hexARgba(colorFin, 0.35);
    const colorAreaFondo = hexARgba(colorFin, 0);

    return {
      grid: { left: 8, right: 24, top: 32, bottom: 8, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: esOscuro ? '#1e293b' : '#ffffff',
        borderColor: esOscuro ? '#334155' : '#e4e4e7',
        textStyle: { color: colorTexto },
        formatter: (parametros) => {
          const punto = Array.isArray(parametros) ? parametros[0] : parametros;
          const pagina = paginas[punto.dataIndex as number];
          const visitas = pagina?.visitas ?? 0;
          const porcentaje = totalVisitas > 0 ? ((visitas / totalVisitas) * 100).toFixed(1) : '0';
          return `<strong>${pagina?.titulo}</strong><br/>/${pagina?.slug}<br/>${visitas.toLocaleString('es-CO')} visitas (${porcentaje}%)`;
        },
      },
      xAxis: {
        type: 'category',
        data: paginas.map((p) => p.titulo),
        axisLine: { lineStyle: { color: esOscuro ? '#334155' : '#e4e4e7' } },
        axisTick: { show: false },
        axisLabel: { color: colorEje, fontSize: 11, rotate: 30, width: 110, overflow: 'truncate', interval: 0 },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: colorEje, fontSize: 11 },
        splitLine: { lineStyle: { color: esOscuro ? '#1e293b' : '#f4f4f5' } },
      },
      series: [
        {
          type: 'line',
          data: paginas.map((p) => p.visitas ?? 0),
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 3, color: colorFin },
          itemStyle: { color: colorFin },
          label: {
            show: true,
            position: 'top',
            color: colorTexto,
            fontWeight: 600,
            fontSize: 11,
            formatter: (p) => (p.value as number).toLocaleString('es-CO'),
          },
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
  }, [paginas, esOscuro, colorFin, totalVisitas]);

  const alto = 420;

  return (
    <div className={`flex flex-col rounded-2xl border p-5 sm:p-6 transition-all ${colorBorde} ${colorBg}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-700/60">
        <div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-white">{titulo}</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitulo}</p>
        </div>
      </div>

      {paginas.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No hay páginas publicadas registradas en este ámbito.
        </div>
      ) : (
        <div className="mt-4">
          <GraficoEcharts option={opcion} alto={alto} />
        </div>
      )}
    </div>
  );
}

/**
 * Ventana modal completa con las dos gráficas de visitas interactivas (Sitio Web e Intranet)
 */
export function ModalDiagramaVisitas({ abierto, onCerrar, resumen }: Props) {
  const [ambitoActivo, setAmbitoActivo] = useState<'sitio' | 'intranet'>('sitio');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar]);

  const { montado, cerrando } = useCierreAnimado(abierto);

  if (!montado || typeof document === 'undefined') return null;

  const paginasSitio = resumen?.sitio ?? [];
  const paginasIntranet = resumen?.intranet ?? [];

  const visitasSitio = paginasSitio.reduce((acc, p) => acc + (p.visitas ?? 0), 0);
  const visitasIntranet = paginasIntranet.reduce((acc, p) => acc + (p.visitas ?? 0), 0);
  const totalVisitas = visitasSitio + visitasIntranet;

  const pctSitio = totalVisitas > 0 ? Math.round((visitasSitio / totalVisitas) * 100) : 0;
  const pctIntranet = totalVisitas > 0 ? Math.round((visitasIntranet / totalVisitas) * 100) : 0;

  return createPortal(
    <div
      className="olo-anim-fondo fixed inset-0 z-[70] flex items-center justify-center bg-[#0f172a]/60 p-3 backdrop-blur-md sm:p-6"
      data-cerrando={cerrando || undefined}
      // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto dentro
      // del panel y suelta el ratón fuera, el clic se contabiliza en el fondo y
      // el panel se cerraba en mitad de la selección.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        className="olo-anim-caja flex max-h-[92dvh] min-h-[min(30rem,92dvh)] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121824]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-ventana-visitas"
      >
        {/* Cabecera de la ventana */}
        <header className="border-b border-zinc-100 px-6 py-5 sm:px-8 dark:border-zinc-800/80">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 id="titulo-ventana-visitas" className="text-xl font-semibold text-[#001631] dark:text-[#e6e8f0]">
                  Ventana de Vistas y Gráfica de Visitas
                </h3>
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-[#94a3b8]">
                Flujo de visitas a las páginas públicas del portal y de intranet.
              </p>
            </div>
          </div>

          {/* Tarjetas KPI de resumen */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Total Visitas
              </span>
              <p className="mt-0.5 text-xl font-bold text-zinc-950 dark:text-white tabular-nums">
                {totalVisitas.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Sitio Web ({pctSitio}%)
              </span>
              <p className="mt-0.5 text-xl font-bold text-emerald-950 dark:text-emerald-200 tabular-nums">
                {visitasSitio.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="rounded-xl border border-sky-200/60 bg-sky-50/50 p-3 dark:border-sky-900/40 dark:bg-sky-950/20">
              <span className="text-[11px] font-medium uppercase tracking-wider text-sky-800 dark:text-sky-400">
                Intranet ({pctIntranet}%)
              </span>
              <p className="mt-0.5 text-xl font-bold text-sky-950 dark:text-sky-200 tabular-nums">
                {visitasIntranet.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </header>

        {/* Contenido con scroll y los 2 gráficos */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Un solo gráfico grande; el selector alterna entre los dos portales */}
          <div
            role="tablist"
            aria-label="Portal"
            className="mb-5 inline-flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/70"
          >
            {(['sitio', 'intranet'] as const).map((ambito) => (
              <button
                key={ambito}
                type="button"
                role="tab"
                aria-selected={ambitoActivo === ambito}
                onClick={() => setAmbitoActivo(ambito)}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  ambitoActivo === ambito
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <span className={`size-2 rounded-full ${ambito === 'sitio' ? 'bg-[#4C7A1C]' : 'bg-sky-500'}`} />
                {ambito === 'sitio' ? 'Sitio web' : 'Intranet'}
              </button>
            ))}
          </div>

          {ambitoActivo === 'sitio' ? (
            <GraficoVisitas
              titulo="Sitio Web"
              subtitulo="Flujo de visitas a las páginas públicas del portal"
              paginas={paginasSitio}
              colorFin="#7db828"
              colorBg="bg-white dark:bg-[#131b2f]"
              colorBorde="border-emerald-200/80 dark:border-emerald-900/40"
            />
          ) : (
            <GraficoVisitas
              titulo="Intranet"
              subtitulo="Flujo de visitas a las secciones institucionales internas"
              paginas={paginasIntranet}
              colorFin="#0284c7"
              colorBg="bg-white dark:bg-[#131b2f]"
              colorBorde="border-sky-200/80 dark:border-sky-900/40"
            />
          )}
        </div>

        {/* Pie de la ventana */}
        <footer className="flex items-center justify-end border-t border-zinc-100 bg-zinc-50/70 px-6 py-4 dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onCerrar}
            // Las medidas de todos los modales (`alert.tsx`): 44 px, esquinas de 32, `#001631`.
            className="h-11 rounded-[32px] bg-[#001631] px-6 text-base font-medium text-white transition hover:bg-[#002a5c] dark:bg-white dark:text-[#001631] dark:hover:bg-[#e6e8f0]"
          >
            Cerrar ventana
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
