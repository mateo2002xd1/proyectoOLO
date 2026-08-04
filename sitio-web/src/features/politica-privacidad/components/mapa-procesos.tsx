'use client';

import React, { useState } from 'react';
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface MapaProcesosProps {
  imageSrc?: string;
  className?: string;
}

export function MapaProcesos({
  imageSrc = '/asset/img/VF_blanco_Mapa_de_Procesos_2026.png',
  className = ''
}: MapaProcesosProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className={`my-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#39A900]"></span>
            <h3 className="text-lg font-bold text-gray-900">
              Mapa de Procesos Institucional 2026
            </h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Estructura de macroprocesos del Observatorio Laboral y Ocupacional - SENA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-[#00324D] focus:outline-none focus:ring-2 focus:ring-[#39A900]/30"
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
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-slate-50 p-2 text-center"
        onClick={() => setIsModalOpen(true)}
      >
        <img
          src={imageSrc}
          alt="Mapa de Procesos Institucional 2026 del SENA y Observatorio Laboral y Ocupacional"
          className="mx-auto max-h-[460px] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          loading="lazy"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-gray-900 shadow-lg">
            <MagnifyingGlassPlusIcon className="h-4 w-4 text-[#39A900]" />
            Hacer clic para ver en pantalla completa
          </span>
        </div>
      </div>

      {/* Leyenda y Clasificación de Procesos */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
          <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            Estratégicos
          </div>
          <p className="mt-1 text-xs text-gray-600">
            Direccionamiento institucional, planeación y gestión de políticas públicas de empleo.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-[#39A900]"></span>
            Misionales
          </div>
          <p className="mt-1 text-xs text-gray-600">
            Investigación ocupacional, encuestas del mercado laboral, análisis y analítica OLO.
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            De Apoyo
          </div>
          <p className="mt-1 text-xs text-gray-600">
            Tecnologías de la información, gestión documental, talento humano y recursos.
          </p>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5">
          <div className="flex items-center gap-2 text-purple-900 font-semibold text-xs uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-purple-600"></span>
            Evaluación y Control
          </div>
          <p className="mt-1 text-xs text-gray-600">
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
            className="relative flex max-h-[92vh] max-w-6xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-[#39A900]" />
                <h4 className="text-base font-bold text-gray-900">
                  Mapa de Procesos Institucional 2026
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                  title={isZoomed ? "Reducir zoom" : "Aumentar zoom"}
                >
                  <MagnifyingGlassPlusIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                  title="Cerrar"
                >
                  <ArrowsPointingInIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Mapa de Procesos Institucional 2026 - Pantalla Completa"
                className={`transition-transform duration-200 rounded-lg shadow-sm ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'max-h-[75vh] w-auto object-contain cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>

            <div className="border-t border-gray-200 px-6 py-3 bg-white flex justify-between items-center text-xs text-gray-500">
              <span>Haga clic en la imagen para alternar zoom</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
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
