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
  className?: string;
}

export function OcupacionSearchBanner({
  value,
  onValueChange,
  onSearch,
  placeholder = 'Buscar ocupación, código o denominación',
  logoSrc = '/asset/img/nos-ocupa-el-pais.png',
  logoAlt = 'Nos ocupa el país',
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
    <div className={`w-full rounded-[28px] bg-[#0b1b32] px-6 py-6 sm:rounded-[32px] sm:px-10 sm:py-8 ${className}`}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <img src={logoSrc} alt={logoAlt} className="h-16 w-auto shrink-0 object-contain sm:h-20" />

        <form onSubmit={handleSubmit} className="w-full flex-1">
          <label htmlFor={inputId} className="sr-only">
            {placeholder}
          </label>
          <div className="relative">
            <input
              id={inputId}
              type="search"
              value={currentValue}
              onChange={(event) => handleChange(event.target.value)}
              placeholder={placeholder}
              className="h-12 w-full rounded-2xl bg-white pl-5 pr-12 text-sm text-[#344054] shadow-sm outline-none transition placeholder:text-[#8a95ad] focus:ring-2 focus:ring-[#20abe3] sm:h-14 sm:text-base"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#8a95ad] transition hover:bg-[#f2f4f7] hover:text-[#20abe3] sm:h-11 sm:w-11"
            >
              <SearchIcon />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
