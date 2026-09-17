'use client';

import { useState } from 'react';
import { DEFINICIONES_NIVELES_OCUPACIONALES } from '../data/base-tendencia-datos';

export function DefinicionesNivelOcupacional() {
  const [mostrarDefiniciones, setMostrarDefiniciones] = useState(true);

  return (
    <div className="sticky top-[96px] z-20 rounded-[16px] border border-[#eaecf0] bg-white/95 px-4 py-3 text-xs shadow-md backdrop-blur-md transition-all text-[#475467]">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMostrarDefiniciones((prev) => !prev)}
          className="flex flex-1 items-center justify-between gap-2 text-left focus:outline-none"
          aria-expanded={mostrarDefiniciones}
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-[#39a900]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold text-[#344054]">
              Definiciones de Nivel Ocupacional
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#39a900]">
            <span>{mostrarDefiniciones ? 'Plegar' : 'Desplegar'}</span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
                mostrarDefiniciones ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {mostrarDefiniciones && (
        <div className="mt-2.5 space-y-1.5 border-t border-[#eaecf0] pt-2.5">
          {DEFINICIONES_NIVELES_OCUPACIONALES.map((item) => (
            <p
              key={item.codigo}
              className="text-[11px] leading-relaxed text-[#475467] sm:text-xs"
            >
              <strong className="font-semibold text-[#344054]">
                {item.titulo}:{' '}
              </strong>
              <span>{item.descripcion}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
