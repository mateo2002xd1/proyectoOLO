'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type PaginaPublicada, type ResumenPaginasPublicadas } from '@/features/paginas';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  resumen: ResumenPaginasPublicadas | null;
}

/**
 * Gráfico de barras individuales para un conjunto de páginas.
 */
function GraficoBarras({
  titulo,
  subtitulo,
  paginas,
  colorClase,
  colorBg,
  colorBorde,
  icono,
  esIntranet = false,
}: {
  titulo: string;
  subtitulo: string;
  paginas: PaginaPublicada[];
  colorClase: string;
  colorBg: string;
  colorBorde: string;
  icono: React.ReactNode;
  esIntranet?: boolean;
}) {
  const [orden, setOrden] = useState<'visitas' | 'alfabetico'>('visitas');

  const totalVisitas = useMemo(
    () => paginas.reduce((acc, p) => acc + (p.visitas ?? 0), 0),
    [paginas]
  );

  const paginasOrdenadas = useMemo(() => {
    const copia = [...paginas];
    if (orden === 'visitas') {
      return copia.sort((a, b) => (b.visitas ?? 0) - (a.visitas ?? 0));
    }
    return copia.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
  }, [paginas, orden]);

  const maxVisitas = useMemo(
    () => Math.max(1, ...paginas.map((p) => p.visitas ?? 0)),
    [paginas]
  );

  return (
    <div className={`flex flex-col rounded-2xl border p-5 sm:p-6 transition-all ${colorBorde} ${colorBg}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-700/60">
        <div className="flex items-center gap-3">
          <div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              {titulo}
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {paginas.length} {paginas.length === 1 ? 'página' : 'páginas'}
              </span>
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitulo}</p>
          </div>
        </div>
      </div>

      {paginas.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No hay páginas publicadas registradas en este ámbito.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {paginasOrdenadas.map((pagina) => {
            const visitas = pagina.visitas ?? 0;
            const porcentajeMax = Math.round((visitas / maxVisitas) * 100);
            const porcentajeTotal = totalVisitas > 0 ? ((visitas / totalVisitas) * 100).toFixed(1) : '0';

            return (
              <div key={pagina.id} className="group relative">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="truncate font-semibold text-zinc-800 transition-colors dark:text-zinc-200"
                      title={pagina.titulo}
                    >
                      {pagina.titulo}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                      /{pagina.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {porcentajeTotal}%
                    </span>
                    <span className="font-bold tabular-nums text-zinc-900 dark:text-white min-w-[3rem] text-right">
                      {visitas.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso / diagrama */}
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${colorClase}`}
                    style={{ width: `${Math.max(4, porcentajeMax)}%` }}
                    role="progressbar"
                    aria-valuenow={visitas}
                    aria-valuemin={0}
                    aria-valuemax={maxVisitas}
                    aria-label={`${pagina.titulo}: ${visitas} visitas`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Ventana modal completa con los dos diagramas de barras interactivos (Sitio Web e Intranet)
 */
export function ModalDiagramaVisitas({ abierto, onCerrar, resumen }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto || typeof document === 'undefined') return null;

  const paginasSitio = resumen?.sitio ?? [];
  const paginasIntranet = resumen?.intranet ?? [];

  const visitasSitio = paginasSitio.reduce((acc, p) => acc + (p.visitas ?? 0), 0);
  const visitasIntranet = paginasIntranet.reduce((acc, p) => acc + (p.visitas ?? 0), 0);
  const totalVisitas = visitasSitio + visitasIntranet;

  const todasLasPaginas = [...paginasSitio, ...paginasIntranet];
  const paginaMasVisitada = todasLasPaginas.reduce<PaginaPublicada | null>((max, p) => {
    if (!max || (p.visitas ?? 0) > (max.visitas ?? 0)) return p;
    return max;
  }, null);

  const pctSitio = totalVisitas > 0 ? Math.round((visitasSitio / totalVisitas) * 100) : 0;
  const pctIntranet = totalVisitas > 0 ? Math.round((visitasIntranet / totalVisitas) * 100) : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0f172a]/60 p-3 backdrop-blur-md sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        className="flex max-h-[92vh] min-h-[30rem] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121824]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-ventana-visitas"
      >
        {/* Cabecera de la ventana */}
        <header className="border-b border-zinc-100 px-6 py-5 sm:px-8 dark:border-zinc-800/80">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 id="titulo-ventana-visitas" className="admin-subtitle text-xl text-zinc-900 dark:text-[#f6f6f6]">
                  Ventana de Vistas y Diagrama de Visitas
                </h3>
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-[#94a3b8]">
                Los datos se actualizan conforme se registran visitas en ambos portales.
              </p>
            </div>

            <button
              type="button"
              onClick={onCerrar}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Cerrar ventana"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tarjetas KPI de resumen */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

            <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <span className="text-[11px] font-medium uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Más Concurrida
              </span>
              <p className="mt-0.5 truncate text-sm font-bold text-amber-950 dark:text-amber-200" title={paginaMasVisitada?.titulo}>
                {paginaMasVisitada ? `${paginaMasVisitada.titulo} (${paginaMasVisitada.visitas ?? 0})` : '—'}
              </p>
            </div>
          </div>
        </header>

        {/* Contenido con scroll y los 2 gráficos */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gráfico 1: Sitio Web */}
            <GraficoBarras
                titulo="Sitio Web"
                subtitulo="Flujo de visitas a las páginas públicas del portal"
                paginas={paginasSitio}
                colorClase="bg-gradient-to-r from-[#4C7A1C] to-[#7db828]"
                colorBg="bg-white dark:bg-[#131b2f]"
                colorBorde="border-emerald-200/80 dark:border-emerald-900/40"
                esIntranet={false}
                icono={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="size-5 text-[#4C7A1C] dark:text-[#7db828]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                }
              />

            {/* Gráfico 2: Intranet */}
            <GraficoBarras
                titulo="Intranet"
                subtitulo="Flujo de visitas a las secciones institucionales internas"
                paginas={paginasIntranet}
                colorClase="bg-gradient-to-r from-[#002c46] to-[#0284c7]"
                colorBg="bg-white dark:bg-[#131b2f]"
                colorBorde="border-sky-200/80 dark:border-sky-900/40"
                esIntranet={true}
                icono={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="size-5 text-sky-600 dark:text-sky-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                  </svg>
                }
              />
          </div>
        </div>

        {/* Pie de la ventana */}
        <footer className="flex items-center justify-end border-t border-zinc-100 bg-zinc-50/70 px-6 py-4 dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Cerrar ventana
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
