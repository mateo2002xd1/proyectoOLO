'use client';

import React, { useState } from 'react';
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon
} from '@heroicons/react/24/outline';

interface MapaProcesosProps {
  imageSrc?: string;
  className?: string;
}

export function MapaProcesos({
  imageSrc = '/assets/img/VF_blanco_Mapa_de_Procesos_2026.png',
  className = ''
}: MapaProcesosProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className={`my-8 rounded-2xl border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#131b2f] p-6 shadow-sm transition-all hover:shadow-md ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-[#1e293b] pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#f6f6f6]">
            Mapa de Procesos Institucional 2026
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Estructura de macroprocesos del Observatorio Laboral y Ocupacional - SENA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-[#2d3649] bg-white dark:bg-[#0b1121] px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-200 shadow-sm transition hover:bg-gray-50 dark:hover:bg-[#1e2538] hover:text-[#00324D] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#39A900]/30"
          >
            <ArrowsPointingOutIcon className="h-4 w-4" />
            <span>Ampliar</span>
          </button>

          <a
            href={imageSrc}
            download="Mapa_de_Procesos_2026.png"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00324D] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#002235] focus:outline-none focus:ring-2 focus:ring-[#00324D]/40"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Descargar</span>
          </a>
        </div>
      </div>

      {/* Imagen Principal */}
      <div
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0b1121] p-2 text-center"
        onClick={() => setIsModalOpen(true)}
      >
        <img
          src={imageSrc}
          alt="Mapa de Procesos Institucional 2026 del SENA y Observatorio Laboral y Ocupacional"
          className="mx-auto max-h-[460px] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          loading="lazy"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/95 dark:bg-[#131b2f]/95 px-4 py-2 text-xs font-semibold text-gray-900 dark:text-white shadow-lg">
            Hacer clic para ver en pantalla completa
          </span>
        </div>
      </div>

      {/* Leyenda y Clasificación de Procesos */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/30 p-3.5">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-semibold text-xs uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            Estratégicos
          </div>
          <p className="mt-1 text-xs text-gray-600 dark:text-slate-300">
            Direccionamiento institucional, planeación y gestión de políticas públicas de empleo.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-[#39A900]"></span>
            Misionales
          </div>
          <p className="mt-1 text-xs text-gray-600 dark:text-slate-300">
            Investigación ocupacional, encuestas del mercado laboral, análisis y analítica OLO.
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/30 p-3.5">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold text-xs uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            De Apoyo
          </div>
          <p className="mt-1 text-xs text-gray-600 dark:text-slate-300">
            Tecnologías de la información, gestión documental, talento humano y recursos.
          </p>
        </div>

        <div className="rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/30 p-3.5">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-semibold text-xs uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-purple-600"></span>
            Evaluación y Control
          </div>
          <p className="mt-1 text-xs text-gray-600 dark:text-slate-300">
            Auditoría de accesos, seguridad de la información, mejora continua y rendición de cuentas.
          </p>
        </div>
      </div>

      {/* Modal de Pantalla Completa */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative flex max-h-[92vh] max-w-6xl flex-col rounded-2xl bg-white dark:bg-[#131b2f] shadow-2xl overflow-hidden border border-transparent dark:border-[#1e293b]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#1e293b] px-6 py-4 bg-gray-50 dark:bg-[#0b1121]">
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-[#f6f6f6]">
                  Mapa de Procesos Institucional 2026
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="rounded-lg p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                  title={isZoomed ? "Reducir zoom" : "Aumentar zoom"}
                >
                  <MagnifyingGlassPlusIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                  title="Cerrar"
                >
                  <ArrowsPointingInIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-slate-100 dark:bg-[#0b1121] flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Mapa de Procesos Institucional 2026 - Pantalla Completa"
                className={`transition-transform duration-200 rounded-lg shadow-sm ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'max-h-[75vh] w-auto object-contain cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>

            <div className="border-t border-gray-200 dark:border-[#1e293b] px-6 py-3 bg-white dark:bg-[#131b2f] flex justify-between items-center text-xs text-gray-500 dark:text-slate-400">
              <span>Haga clic en la imagen para alternar zoom</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-gray-100 dark:bg-[#1e293b] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-zinc-700"
              >
                Cerrar vista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
