'use client';

import { useState, useMemo } from 'react';
import { type ResumenPaginasPublicadas } from '@/features/paginas';
import { ModalDiagramaVisitas } from './modal-diagrama-visitas';

interface Props {
  resumen: ResumenPaginasPublicadas | null;
  error: string | null;
}

/**
 * Tarjeta de Visitas para el Dashboard.
 * Contiene 2 diagramas de barras interactivos (Sitio Web e Intranet) con sus páginas correspondientes,
 * y permite abrir la ventana modal completa con métricas detalladas.
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

  const maxVisitas = useMemo(
    () => Math.max(1, ...paginasMostradas.map((p) => p.visitas ?? 0)),
    [paginasMostradas]
  );

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155] flex flex-col justify-between">
        <div>
          {/* Encabezado con título y botón para abrir la ventana de vistas */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-[#94a3b8]">Visitas</p>
              {error ? (
                <p className="mt-1 text-2xl font-bold text-zinc-400 dark:text-zinc-600">—</p>
              ) : (
                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6] tabular-nums">
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
                  onClick={() => setPestanaActiva('sitio')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium transition-colors ${
                    pestanaActiva === 'sitio'
                      ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <span className="size-2 rounded-full bg-[#4C7A1C]" />
                  <span>Sitio web ({totalVisitasSitio.toLocaleString('es-CO')})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPestanaActiva('intranet')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium transition-colors ${
                    pestanaActiva === 'intranet'
                      ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <span className="size-2 rounded-full bg-sky-500" />
                  <span>Intranet ({totalVisitasIntranet.toLocaleString('es-CO')})</span>
                </button>
              </div>

              {/* Diagrama de barras correspondiente al gráfico seleccionado */}
              <div className="space-y-2">
                {paginasMostradas.length === 0 ? (
                  <p className="py-3 text-center text-xs text-zinc-400">Sin páginas registradas</p>
                ) : (
                  paginasMostradas.map((pagina) => {
                    const visitas = pagina.visitas ?? 0;
                    const pct = Math.round((visitas / maxVisitas) * 100);

                    return (
                      <div key={pagina.id} className="text-xs">
                        <div className="mb-0.5 flex items-center justify-between gap-1.5">
                          <span
                            className="truncate text-zinc-600 transition-colors dark:text-zinc-300"
                            title={pagina.titulo}
                          >
                            {pagina.titulo}
                          </span>
                          <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                            {visitas.toLocaleString('es-CO')}
                          </span>
                        </div>

                        {/* Barra del diagrama */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              esIntranet
                                ? 'bg-gradient-to-r from-[#002c46] to-[#0284c7]'
                                : 'bg-gradient-to-r from-[#4C7A1C] to-[#7db828]'
                            }`}
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enlace inferior para ver la ventana de vistas completa */}
        {!error && (
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 text-xs font-medium text-[#4C7A1C] transition hover:underline dark:border-[#7db828]/20 dark:text-[#9ED65C]"
          >
            <span>Ver diagrama de ambos portales</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
              <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
            </svg>
          </button>
        )}
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
