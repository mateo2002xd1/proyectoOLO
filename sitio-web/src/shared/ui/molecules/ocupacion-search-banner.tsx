'use client';

import { useId, useState, type FormEvent } from 'react';

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5 sm:h-5.5 sm:w-5.5">
      <path
        d="m17.5 17.5-3.6-3.6m1.6-4.4a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface OcupacionSearchBannerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  logoSrc?: string;
  logoAlt?: string;
  modelSrc?: string;
  modelAlt?: string;
  className?: string;
}

export function OcupacionSearchBanner({
  value,
  onValueChange,
  onSearch,
  placeholder = 'Buscar ocupación, código o denominación',
  logoSrc = '/assets/img/nos-ocupa-el-pais.png',
  logoAlt = 'Nos ocupa el país',
  modelSrc = '/assets/img/modelo-uno.png',
  modelAlt = 'Modelo',
  className = '',
}: OcupacionSearchBannerProps) {
  const inputId = useId();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState('');
  const currentValue = isControlled ? value : internalValue;

  function handleChange(next: string) {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch?.(currentValue);
  }

  return (
    <div className={`relative overflow-hidden w-[98%] min-h-[380px] sm:h-[426px] flex justify-center items-center rounded-[16px] bg-[#001631] px-4 py-6 sm:px-10 sm:py-8 ${className}`}>
      {/* Capa inferior: Modelo enmarcando el fondo en móvil y ajustado al 50% en desktop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={modelSrc}
        alt={modelAlt}
        className="absolute inset-0 sm:inset-auto sm:bottom-0 sm:left-0 z-0 h-full w-full sm:w-1/2 object-cover sm:object-contain object-bottom pointer-events-none opacity-80 sm:opacity-100"
      />

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center gap-4 sm:flex-row sm:gap-12 h-full">
        <div className="relative w-full h-[25%] min-h-[60px] sm:h-full sm:w-1/2 flex justify-center items-center sm:min-h-[220px]">
          {/* Capa superior: Nos ocupa el país (posicionada en la parte superior izquierda) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt={logoAlt}
            className="absolute top-2 left-2 z-10 h-10 sm:h-16 md:h-20 w-auto object-contain sm:top-4 sm:left-4"
          />
        </div>

        <form onSubmit={handleSubmit} className="w-full h-[75%] sm:h-full sm:w-1/2 flex flex-col justify-center items-start">
          <label htmlFor={inputId} className="sr-only">
            {placeholder}
          </label>
          <div className="w-full max-w-[480px] relative">
            <h2 className='text-white text-[16px] sm:text-[20px] md:text-[24px] font-light italic leading-tight'>Explora las ocupaciones clave de los</h2>
            <h2 className='text-white mb-4 sm:mb-6 font-bold text-[16px] sm:text-[20px] md:text-[24px] leading-tight'>sectores productivos en Colombia.</h2>

            <div className="relative w-full">
              <input
                id={inputId}
                type="search"
                value={currentValue}
                onChange={(event) => handleChange(event.target.value)}
                placeholder={placeholder}
                className="h-12 w-full rounded-[16px] bg-white pl-5 pr-12 text-sm text-[#344054] shadow-sm outline-none transition placeholder:text-[#8a95ad] focus:ring-2 focus:ring-[#697B8C] sm:h-14 sm:text-base"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="group absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#8a95ad] transition-colors duration-300 ease-in-out hover:bg-[#001631] hover:text-[#ffffff] sm:h-11 sm:w-11"
              >
                <span className="flex items-center justify-center transition-transform duration-300 ease-in-out group-hover:scale-110 group-active:scale-95">
                  <SearchIcon />
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
