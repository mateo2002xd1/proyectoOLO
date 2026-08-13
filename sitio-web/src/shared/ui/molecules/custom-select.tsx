"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[] | string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Necesario cuando la etiqueta visible no es un `<label>` asociado. */
  ariaLabel?: string;
};

/**
 * Desplegable con lista propia.
 *
 * El `<select>` nativo no sirve para esto: la lista de opciones la dibuja el
 * navegador y no acepta ni esquinas, ni color de fondo al pasar por encima, ni
 * tipografía. Por eso aquí la lista es un `listbox` de botones — es la única
 * forma de que se vea como el resto del panel.
 */

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={`h-4 w-4 transition duration-200 ${isOpen ? "rotate-180" : ""}`}
    >
      <path
        d="m5 7.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  disabled = false,
  className = "",
  ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const normalizedOptions: Option[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!(event.target instanceof Node)) return;
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((current) => !current)}
        className={`group flex h-11 w-full items-center justify-between rounded-[16px] border px-3 text-left outline-none transition duration-200 ${
          isOpen
            ? "border-[#002237] bg-white shadow-[0_0_0_3px_rgba(0,34,55,0.12)] dark:bg-[#252f47]"
            : "border-[#d0d5dd] bg-white hover:border-[#002237]/40 hover:bg-[#002237]/5 dark:border-[#2d3649] dark:bg-[#252f47] dark:hover:border-[#3a4660] dark:hover:bg-white/5"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`truncate text-sm font-medium ${
              selectedOption
                ? "text-[#344054] dark:text-[#e6e8f0]"
                : "text-[#8a95ad] dark:text-[#95a0b8]"
            }`}
          >
            {displayLabel}
          </span>
        </span>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
            isOpen
              ? "bg-[#002237]/10 text-[#002237] dark:bg-[#2f3a54] dark:text-[#a7b2cb]"
              : "bg-[#f2f4f7] text-[#667085] group-hover:bg-[#002237]/10 group-hover:text-[#002237] dark:bg-[#2f3a54] dark:text-[#a7b2cb] dark:group-hover:bg-[#374565] dark:group-hover:text-[#a7b2cb]"
          }`}
        >
          <ChevronDownIcon isOpen={isOpen} />
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 z-[200] mt-1"
        >
          <div
            className="max-h-60 overflow-y-auto overflow-x-hidden rounded-[16px] border border-[#d0d5dd] bg-white p-1.5 shadow-[0_18px_30px_-12px_rgba(15,23,42,0.3)] dark:border-[#2d3649] dark:bg-[#1e2538]"
            role="listbox"
          >
            {normalizedOptions.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition duration-150 ${
                    isSelected
                      ? "bg-[#002237]/5 text-[#002237] dark:bg-white/10 dark:text-[#e6e8f0]"
                      : "text-[#57607b] hover:bg-[#002237]/5 hover:text-[#002237] dark:text-[#b7c0d6] dark:hover:bg-white/5 dark:hover:text-[#e6e8f0]"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 transition ${isSelected ? "bg-[#002237] shadow-[0_0_0_4px_rgba(0,34,55,0.12)] dark:bg-[#7c8db0]" : "bg-[#d8dde7] dark:bg-[#3a4660]"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
