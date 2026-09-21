'use client';

import { useState } from 'react';

interface BannerDepartamentoFuentesProps {
  departamento: string;
  titulo?: string;
  subtitulo?: string;
  descripcion?: string;
  colorFondo?: string;
  fuentes?: string;
}

export function BannerDepartamentoFuentes({
  departamento,
  titulo,
  subtitulo,
  descripcion,
  colorFondo,
  fuentes,
}: BannerDepartamentoFuentesProps) {
  const [desplegado, setDesplegado] = useState(true);

  const tituloEfectivo =
    typeof titulo === 'string' && titulo.trim() !== ''
      ? titulo.trim()
      : (departamento || 'Nacional');

  const subtituloLimpio = typeof subtitulo === 'string' ? subtitulo.trim() : '';
  const descripcionLimpia = typeof descripcion === 'string' ? descripcion.trim() : '';
  const fuentesLimpia = typeof fuentes === 'string' ? fuentes.trim() : '';
  const tieneContenido = Boolean(subtituloLimpio || descripcionLimpia || fuentesLimpia);
  const colorAcento = colorFondo && colorFondo.trim() !== '' ? colorFondo : '#39a900';

  return (
    <div
      aria-label="Información del departamento"
      className="rounded-[16px] border border-[#eaecf0] bg-white px-4 py-3 text-xs shadow-sm transition-all text-[#475467]"
    >
      <div className="flex items-center justify-between gap-2">
        {tieneContenido ? (
          <button
            type="button"
            onClick={() => setDesplegado((prev) => !prev)}
            className="flex flex-1 items-center justify-between gap-2 text-left focus:outline-none"
            aria-expanded={desplegado}
          >
            <span className="font-semibold text-[#344054]">
              {tituloEfectivo}
            </span>
            <div
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: colorAcento }}
            >
              <span>{desplegado ? 'Plegar' : 'Desplegar'}</span>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
                  desplegado ? 'rotate-180' : ''
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
        ) : (
          <span className="font-semibold text-[#344054]">
            {tituloEfectivo}
          </span>
        )}
      </div>

      {tieneContenido && desplegado && (
        <div className="mt-2.5 space-y-2 border-t border-[#eaecf0] pt-2.5">
          {subtituloLimpio && (
            <p
              className="text-xs sm:text-sm font-semibold text-[#344054]"
              style={colorFondo ? { color: colorFondo } : undefined}
            >
              {subtituloLimpio}
            </p>
          )}
          {descripcionLimpia && (
            <p className="text-[11px] leading-relaxed text-[#475467] sm:text-xs whitespace-pre-line">
              {descripcionLimpia}
            </p>
          )}
          {fuentesLimpia && (
            <p className="text-[11px] leading-relaxed text-[#475467] sm:text-xs">
              <strong className="font-semibold text-[#344054]">
                Principales Fuentes:{' '}
              </strong>
              <span>{fuentesLimpia}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
