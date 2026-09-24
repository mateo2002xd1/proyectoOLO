'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * Selector de año con calendario propio, hermano de `DatePicker`: el mismo campo y el
 * mismo panel, pero en vez de los días de un mes muestra los años de una década.
 *
 * ## Por qué no un desplegable
 *
 * Un desplegable solo ofrece los años que alguien puso en la lista: para cargar 2027 había
 * que esperar a que la lista lo trajera. Aquí se navega por décadas con las flechas, o se
 * **escribe** el año (Enter lo elige), dentro de `min`–`max`; `disponibles` restringe
 * además a los que tienen datos (el buscador del sitio no deja pedir un año sin nada
 * publicado).
 *
 * El valor es el año como texto (`'2027'`), o cadena vacía si no hay ninguno: el mismo
 * formato que usaba el desplegable, así que filtros y API no se enteran del cambio.
 */

/** Los años de la década y uno a cada lado, como los días de otro mes en `DatePicker`. */
const CELDAS = 12;

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

function ChevronIcon({ hacia }: { hacia: 'izquierda' | 'derecha' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d={hacia === 'izquierda' ? 'm12 4-5 6 5 6' : 'm8 4 5 6-5 6'} />
    </svg>
  );
}

const decadaDe = (anio: number) => Math.floor(anio / 10) * 10;

type YearPickerProps = {
  /** Año como texto (`'2027'`), o cadena vacía si no hay ninguno. */
  value: string;
  onChange: (value: string) => void;
  /** Rango elegible, inclusivo. */
  min: number;
  max: number;
  /** Si se da, solo estos años se pueden elegir; los demás del rango se ven apagados. */
  disponibles?: number[];
  placeholder?: string;
  /**
   * Con texto, «sin año» es una opción: el campo lo muestra cuando está vacío y el pie
   * del calendario ofrece volver a él (p. ej. «Todos los años» en un filtro).
   */
  textoSinAnio?: string;
  disabled?: boolean;
  className?: string;
  /** Necesario cuando la etiqueta visible no es un `<label>` asociado. */
  ariaLabel?: string;
};

export function YearPicker({
  value,
  onChange,
  min,
  max,
  disponibles,
  placeholder = 'aaaa',
  textoSinAnio,
  disabled = false,
  className = '',
  ariaLabel,
}: YearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [decada, setDecada] = useState(() => decadaDe(Number(value) || new Date().getFullYear()));
  /** Lo que se va escribiendo en la casilla del calendario: solo cifras, hasta cuatro. */
  const [escrito, setEscrito] = useState('');
  const idAviso = useId();

  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const disparadorRef = useRef<HTMLButtonElement | null>(null);

  const anioActual = new Date().getFullYear();
  const elegible = (anio: number) =>
    anio >= min && anio <= max && (!disponibles || disponibles.includes(anio));

  /**
   * Abre en la década del año elegido; sin año, en la del actual acotado al rango (así un
   * buscador cuyo último año con datos es 2019 no abre en una década vacía).
   * Se hace aquí y no en un efecto, por la misma razón que en `DatePicker`.
   */
  const abrir = () => {
    const referencia = Number(value) || Math.min(Math.max(anioActual, min), max);
    setDecada(decadaDe(referencia));
    setEscrito('');
    setIsOpen(true);
  };

  const anioEscrito = /^\d{4}$/.test(escrito) ? Number(escrito) : null;
  const avisoEscrito =
    anioEscrito === null || elegible(anioEscrito)
      ? null
      : anioEscrito < min || anioEscrito > max
        ? `Elija un año entre ${min} y ${max}.`
        : `${anioEscrito} no tiene datos.`;

  /** Solo cifras; con las cuatro, el calendario salta a esa década para que se vea. */
  const alEscribir = (texto: string) => {
    const soloCifras = texto.replace(/\D/g, '').slice(0, 4);
    setEscrito(soloCifras);
    if (soloCifras.length === 4) setDecada(decadaDe(Number(soloCifras)));
  };

  useEffect(() => {
    if (!isOpen) return;

    function alPulsarFuera(evento: MouseEvent | TouchEvent) {
      if (!(evento.target instanceof Node)) return;
      if (!contenedorRef.current?.contains(evento.target)) setIsOpen(false);
    }

    function alTeclear(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return;
      setIsOpen(false);
      disparadorRef.current?.focus();
    }

    document.addEventListener('mousedown', alPulsarFuera);
    document.addEventListener('touchstart', alPulsarFuera);
    window.addEventListener('keydown', alTeclear);

    return () => {
      document.removeEventListener('mousedown', alPulsarFuera);
      document.removeEventListener('touchstart', alPulsarFuera);
      window.removeEventListener('keydown', alTeclear);
    };
  }, [isOpen]);

  const elegir = (anio: string) => {
    onChange(anio);
    setIsOpen(false);
    disparadorRef.current?.focus();
  };

  const celdas = Array.from({ length: CELDAS }, (_, i) => decada - 1 + i);
  // Una flecha solo lleva a una década con algún año dentro del rango.
  const hayAnterior = decada > min;
  const haySiguiente = decada + 10 <= max;

  const texto = value || textoSinAnio || '';

  return (
    <div ref={contenedorRef} className={`relative ${className}`}>
      <button
        ref={disparadorRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (isOpen) setIsOpen(false);
          else abrir();
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`group flex h-11 w-full items-center justify-between gap-2 rounded-[16px] border px-3 text-left outline-none transition duration-200 ${isOpen
          ? 'border-[#002237] bg-white shadow-[0_0_0_3px_rgba(0,34,55,0.12)] dark:bg-[#252f47]'
          : 'border-[#d0d5dd] bg-white hover:border-[#002237]/40 hover:bg-[#002237]/5 dark:border-[#2d3649] dark:bg-[#252f47] dark:hover:border-[#3a4660] dark:hover:bg-white/5'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span
          className={`truncate text-sm font-medium tabular-nums ${texto ? 'text-[#344054] dark:text-[#e6e8f0]' : 'text-[#8a95ad] dark:text-[#95a0b8]'
            }`}
        >
          {texto || placeholder}
        </span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${isOpen
            ? 'bg-[#002237]/10 text-[#002237] dark:bg-[#2f3a54] dark:text-[#a7b2cb]'
            : 'bg-[#f2f4f7] text-[#667085] group-hover:bg-[#002237]/10 group-hover:text-[#002237] dark:bg-[#2f3a54] dark:text-[#a7b2cb] dark:group-hover:bg-[#374565] dark:group-hover:text-[#a7b2cb]'
            }`}
        >
          <CalendarIcon />
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={ariaLabel ? `Calendario de ${ariaLabel}` : 'Calendario de años'}
          className="absolute left-0 top-full z-[200] mt-1 w-[17.5rem] rounded-[16px] border border-[#d0d5dd] bg-white p-3 shadow-[0_18px_30px_-12px_rgba(15,23,42,0.3)] dark:border-[#2d3649] dark:bg-[#1e2538]"
        >
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={escrito}
                onChange={(evento) => alEscribir(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key !== 'Enter') return;
                  // Dentro de un <form>, Enter lo enviaría.
                  evento.preventDefault();
                  if (anioEscrito !== null && elegible(anioEscrito)) elegir(escrito);
                }}
                placeholder="Escriba el año"
                aria-label="Escribir el año"
                aria-invalid={avisoEscrito !== null}
                aria-describedby={avisoEscrito ? idAviso : undefined}
                className="h-9 min-w-0 flex-1 rounded-[10px] border border-[#d0d5dd] bg-white px-3 text-sm tabular-nums text-[#344054] outline-none transition placeholder:text-[#8a95ad] focus:border-[#002237] focus:shadow-[0_0_0_3px_rgba(0,34,55,0.12)] dark:border-[#2d3649] dark:bg-[#252f47] dark:text-[#e6e8f0] dark:placeholder:text-[#95a0b8]"
              />
              <button
                type="button"
                onClick={() => elegir(escrito)}
                disabled={anioEscrito === null || !elegible(anioEscrito)}
                className="h-9 rounded-[10px] bg-[#002237] px-3 text-xs font-semibold text-white transition hover:bg-[#002237]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#4a6490]"
              >
                Elegir
              </button>
            </div>
            {avisoEscrito && (
              <p id={idAviso} className="mt-1 text-xs text-red-600 dark:text-red-400">
                {avisoEscrito}
              </p>
            )}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold tabular-nums text-[#344054] dark:text-[#e6e8f0]">
              {decada} – {decada + 9}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDecada((d) => d - 10)}
                disabled={!hayAnterior}
                aria-label="Década anterior"
                className="flex h-7 w-7 items-center justify-center rounded-[10px] text-[#667085] transition hover:bg-[#002237]/5 hover:text-[#002237] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#a7b2cb] dark:hover:bg-white/5 dark:hover:text-[#e6e8f0]"
              >
                <ChevronIcon hacia="izquierda" />
              </button>
              <button
                type="button"
                onClick={() => setDecada((d) => d + 10)}
                disabled={!haySiguiente}
                aria-label="Década siguiente"
                className="flex h-7 w-7 items-center justify-center rounded-[10px] text-[#667085] transition hover:bg-[#002237]/5 hover:text-[#002237] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#a7b2cb] dark:hover:bg-white/5 dark:hover:text-[#e6e8f0]"
              >
                <ChevronIcon hacia="derecha" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {celdas.map((anio) => {
              const comoValor = String(anio);
              const elegido = comoValor === value;
              const esActual = anio === anioActual;
              const bloqueado = !elegible(anio);
              const deLaDecada = decadaDe(anio) === decada;

              return (
                <button
                  key={anio}
                  type="button"
                  disabled={bloqueado}
                  onClick={() => elegir(comoValor)}
                  aria-pressed={elegido}
                  aria-current={esActual ? 'date' : undefined}
                  className={`flex h-10 items-center justify-center rounded-[10px] text-sm tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] ${elegido
                    ? 'bg-[#002237] font-semibold text-white dark:bg-[#4a6490]'
                    : bloqueado
                      ? 'cursor-not-allowed text-[#d8dde7] dark:text-[#3a4660]'
                      : deLaDecada
                        ? 'text-[#344054] hover:bg-[#002237]/5 hover:text-[#002237] dark:text-[#b7c0d6] dark:hover:bg-white/5 dark:hover:text-[#e6e8f0]'
                        : 'text-[#b5bdcc] hover:bg-[#002237]/5 dark:text-[#6b7690] dark:hover:bg-white/5'
                    } ${esActual && !elegido ? 'ring-1 ring-inset ring-[#002237]/40 dark:ring-[#4a6490]' : ''}`}
                >
                  {anio}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-[#eaecf0] pt-2 dark:border-[#2d3649]">
            {textoSinAnio ? (
              <button
                type="button"
                onClick={() => elegir('')}
                className="rounded-[10px] px-2 py-1 text-xs font-medium text-[#667085] transition hover:bg-[#002237]/5 hover:text-[#002237] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] dark:text-[#a7b2cb] dark:hover:bg-white/5 dark:hover:text-[#e6e8f0]"
              >
                {textoSinAnio}
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => elegir(String(anioActual))}
              disabled={!elegible(anioActual)}
              className="rounded-[10px] px-2 py-1 text-xs font-semibold text-[#002237] transition hover:bg-[#002237]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#a7b2cb] dark:hover:bg-white/5"
            >
              Este año
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
