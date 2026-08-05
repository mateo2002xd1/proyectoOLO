'use client';

import React, { useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';

interface VisorDocumentoProps {
  titulo: string;
  descripcion?: string;
  url: string;
}

export function VisorDocumento({
  titulo,
  descripcion,
  url
}: VisorDocumentoProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasFrameError, setHasFrameError] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#131b2f] p-6 shadow-sm transition-all hover:shadow-md">
      {/* Encabezado del Visor */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-[#1e293b] pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-[#f6f6f6]">{titulo}</h3>
          {descripcion && (
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              {descripcion}
            </p>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-[#2d3649] bg-white dark:bg-[#0b1121] px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 shadow-sm transition hover:bg-gray-50 dark:hover:bg-[#1e2538] hover:text-[#00324D] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#39A900]/30"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-500 dark:text-slate-400" />
            <span>Abrir en nueva pestaña</span>
          </a>

          <a
            href={url}
            download
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#39A900] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#329200] focus:outline-none focus:ring-2 focus:ring-[#39A900]/40"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Descargar PDF</span>
          </a>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00324D] px-3.5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#002235] focus:outline-none focus:ring-2 focus:ring-[#00324D]/40"
            title="Ver a pantalla completa"
          >
            <ArrowsPointingOutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Pantalla Completa</span>
          </button>
        </div>
      </div>

      {/* Contenedor del PDF Embebido */}
      <div className="relative h-[650px] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#0b1121] shadow-inner">
        <iframe
          src={url}
          title={titulo}
          className="h-full w-full border-0"
          onError={() => setHasFrameError(true)}
        />

        {/* Barra de pie de visualizador */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-[#131b2f]/95 backdrop-blur-md px-4 py-2 border-t border-gray-200 dark:border-[#1e293b] flex flex-wrap items-center justify-between text-xs text-gray-600 dark:text-slate-300">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Documento oficial alojado en CompromISO SENA
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold underline text-xs"
          >
            ¿Problemas para visualizar? Haga clic aquí para abrir directamente
          </a>
        </div>
      </div>

      {/* Modal de Pantalla Completa */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative flex h-[94vh] w-full max-w-6xl flex-col rounded-2xl bg-white dark:bg-[#131b2f] shadow-2xl overflow-hidden border border-transparent dark:border-[#1e293b]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#1e293b] px-6 py-4 bg-gray-50 dark:bg-[#0b1121]">
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-[#f6f6f6]">{titulo}</h4>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#00324D] dark:text-emerald-400 hover:underline"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  Abrir link
                </a>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="rounded-lg p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowsPointingInIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-200 dark:bg-[#0b1121]">
              <iframe
                src={url}
                title={`${titulo} - Pantalla Completa`}
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
