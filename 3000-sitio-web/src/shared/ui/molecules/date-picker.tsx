'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Selector de fecha con calendario propio.
 *
 * ## Por qué no un `<input type="date">`
 *
 * El calendario que abre el input nativo lo dibuja el navegador, no la página:
 * ni su borde, ni sus esquinas, ni el color al pasar por encima de un día se
 * pueden tocar desde CSS. Cambiaba además de aspecto entre Chrome, Firefox y
 * Safari. Para que la fecha se vea como el resto del panel hay que pintar el
 * calendario, que es lo que hace esto.
 *
 * El valor sigue siendo el mismo formato del input nativo —`YYYY-MM-DD`— para
 * que los filtros, la API y los `min`/`max` no se enteren del cambio.
 */

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const CELDAS = 42; // 6 semanas: la altura del calendario no baila al cambiar de mes

const formatoMes = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });
const formatoDiaLargo = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * `YYYY-MM-DD` a fecha local.
 *
 * A mano y no con `new Date(iso)`: esa forma interpreta la cadena como UTC, así
 * que en Colombia (UTC-5) el 12 de agosto se convertía en el 11 al pintarlo.
 */
function aFecha(iso: string): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!partes) return null;
  const fecha = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function aIso(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Lo que se lee en el campo cerrado, en el orden que se usa aquí. */
function comoTexto(iso: string): string {
  const fecha = aFecha(iso);
  if (!fecha) return '';
  return `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
}

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

type DatePickerProps = {
  /** Fecha en `YYYY-MM-DD`, o cadena vacía si no hay ninguna. */
  value: string;
  onChange: (value: string) => void;
  /** Límites del rango, en el mismo formato. Los días fuera no se pueden elegir. */
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Necesario cuando la etiqueta visible no es un `<label>` asociado. */
  ariaLabel?: string;
};

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = 'dd/mm/aaaa',
  disabled = false,
  className = '',
  ariaLabel,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mesVisible, setMesVisible] = useState(() => {
    const elegida = aFecha(value) ?? new Date();
    return new Date(elegida.getFullYear(), elegida.getMonth(), 1);
  });

  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const disparadorRef = useRef<HTMLButtonElement | null>(null);

  const hoy = new Date();
  const isoHoy = aIso(hoy);
  const texto = comoTexto(value);

  /**
   * Abre el calendario en el mes de la fecha elegida.
   *
   * Se recoloca aquí y no en un efecto: si alguien navegó hasta 2019 y cerró sin
   * elegir, la próxima apertura no debe seguir allí, y hacerlo con `setState`
   * dentro de un efecto encadena un render de más por cada apertura.
   */
  const abrir = () => {
    const elegida = aFecha(value) ?? new Date();
    setMesVisible(new Date(elegida.getFullYear(), elegida.getMonth(), 1));
    setIsOpen(true);
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
      // El foco vuelve al campo: si se queda en un día que acaba de desaparecer,
      // el teclado se pierde al principio de la página.
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

  const fueraDeRango = (iso: string) => (min && iso < min) || (max && iso > max);

  const elegir = (iso: string) => {
    if (fueraDeRango(iso)) return;
    onChange(iso);
    setIsOpen(false);
    disparadorRef.current?.focus();
  };

  const cambiarMes = (salto: number) =>
    setMesVisible((mes) => new Date(mes.getFullYear(), mes.getMonth() + salto, 1));

  // La rejilla empieza en lunes, como el calendario del navegador en español:
  // `getDay()` da 0 para domingo, así que se rota.
  const primerDia = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
  const desplazamiento = (primerDia.getDay() + 6) % 7;

  const celdas = Array.from({ length: CELDAS }, (_, i) => {
    const fecha = new Date(
      mesVisible.getFullYear(),
      mesVisible.getMonth(),
      i - desplazamiento + 1,
    );
    return { fecha, iso: aIso(fecha), delMes: fecha.getMonth() === mesVisible.getMonth() };
  });

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
          className={`truncate text-sm font-medium ${texto ? 'text-[#344054] dark:text-[#e6e8f0]' : 'text-[#8a95ad] dark:text-[#95a0b8]'
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
          aria-label={ariaLabel ? `Calendario de ${ariaLabel}` : 'Calendario'}
          className="absolute left-0 top-full z-[200] mt-1 w-[17.5rem] rounded-[16px] border border-[#d0d5dd] bg-white p-3 shadow-[0_18px_30px_-12px_rgba(15,23,42,0.3)] dark:border-[#2d3649] dark:bg-[#1e2538]"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold capitalize text-[#344054] dark:text-[#e6e8f0]">
              {formatoMes.format(mesVisible)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => cambiarMes(-1)}
                aria-label="Mes anterior"
                className="flex h-7 w-7 items-center justify-center rounded-[10px] text-[#667085] transition hover:bg-[#002237]/5 hover:text-[#002237] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] dark:text-[#a7b2cb] dark:hover:bg-white/5 dark:hover:text-[#e6e8f0]"
              >
                <ChevronIcon hacia="izquierda" />
              </button>
              <button
                type="button"
                onClick={() => cambiarMes(1)}
                aria-label="Mes siguiente"
                className="flex h-7 w-7 items-center justify-center rounded-[10px] text-[#667085] transition hover:bg-[#002237]/5 hover:text-[#002237] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] dark:text-[#a7b2cb] dark:hover:bg-white/5 dark:hover:text-[#e6e8f0]"
              >
                <ChevronIcon hacia="derecha" />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {DIAS.map((dia, i) => (
              // Decorativas: la inicial sola no dice nada a un lector de pantalla
              // (hay dos «M»), y cada día ya se anuncia con su fecha completa.
              <span
                key={`${dia}-${i}`}
                className="flex h-7 items-center justify-center text-[11px] font-semibold uppercase text-[#8a95ad] dark:text-[#95a0b8]"
                aria-hidden="true"
              >
                {dia}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {celdas.map(({ fecha, iso, delMes }) => {
              const elegido = iso === value;
              const esHoy = iso === isoHoy;
              const bloqueado = !!fueraDeRango(iso);

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={bloqueado}
                  onClick={() => elegir(iso)}
                  aria-label={formatoDiaLargo.format(fecha)}
                  aria-pressed={elegido}
                  aria-current={esHoy ? 'date' : undefined}
                  className={`flex h-9 items-center justify-center rounded-[10px] text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] ${elegido
                    ? 'bg-[#002237] font-semibold text-white dark:bg-[#4a6490]'
                    : bloqueado
                      ? 'cursor-not-allowed text-[#d8dde7] dark:text-[#3a4660]'
                      : delMes
                        ? 'text-[#344054] hover:bg-[#002237]/5 hover:text-[#002237] dark:text-[#b7c0d6] dark:hover:bg-white/5 dark:hover:text-[#e6e8f0]'
                        : 'text-[#b5bdcc] hover:bg-[#002237]/5 dark:text-[#6b7690] dark:hover:bg-white/5'
                    } ${esHoy && !elegido ? 'ring-1 ring-inset ring-[#002237]/40 dark:ring-[#4a6490]' : ''}`}
                >
                  {fecha.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-[#eaecf0] pt-2 dark:border-[#2d3649]">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
                disparadorRef.current?.focus();
              }}
              className="rounded-[10px] px-2 py-1 text-xs font-medium text-[#667085] transition hover:bg-[#002237]/5 hover:text-[#002237] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] dark:text-[#a7b2cb] dark:hover:bg-white/5 dark:hover:text-[#e6e8f0]"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => elegir(isoHoy)}
              disabled={!!fueraDeRango(isoHoy)}
              className="rounded-[10px] px-2 py-1 text-xs font-semibold text-[#002237] transition hover:bg-[#002237]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002237] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#a7b2cb] dark:hover:bg-white/5"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
