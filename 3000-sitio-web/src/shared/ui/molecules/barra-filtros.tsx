'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

interface BarraFiltrosProps {
  /** Cuántos filtros tienen valor: el botón del móvil lo muestra aunque estén plegados. */
  activos: number;
  children: ReactNode;
}

/**
 * Banda de filtros de las tablas del panel (Auditoría, Respaldos, Revisión).
 *
 * Desde `lg` los filtros están siempre a la vista, en una fila que envuelve. Por
 * debajo se pliegan tras un botón «Filtros»: en el móvil, seis filtros apilados
 * ocupaban la pantalla entera antes de la primera fila de la tabla. Desplegados,
 * van a una columna en el móvil y a dos desde `sm`.
 */
export function BarraFiltros({ activos, children }: BarraFiltrosProps) {
  const [abierta, setAbierta] = useState(false);
  const id = useId();

  return (
    <div className="mb-4">
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={id}
        onClick={() => setAbierta((a) => !a)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-[16px] border border-[#d0d5dd] bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-[#002237]/40 dark:border-[#2d3649] dark:bg-[#252f47] dark:text-zinc-200 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filtros
          {activos > 0 && (
            <span className="rounded-full bg-[#002237] px-2 py-0.5 text-xs font-semibold text-white dark:bg-[#7db828] dark:text-[#0b1121]">
              {activos}
              <span className="sr-only"> aplicados</span>
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`transition-transform ${abierta ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        id={id}
        className={`${abierta ? 'grid' : 'hidden'} mt-3 grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-0 lg:flex lg:flex-wrap lg:items-end`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Etiqueta encima del control.
 *
 * Es un `div` y no un `label`: los filtros ya no son campos nativos sino botones
 * que abren su propia lista, y un `label` no puede etiquetar a un botón. El nombre
 * viaja por `ariaLabel` en cada control.
 *
 * Ancho fijo solo desde `lg`, donde van en fila; antes, el de la columna.
 */
export function CampoFiltro({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 lg:w-44">
      <span className="text-xs font-medium text-zinc-500 dark:text-[#94a3b8]">{etiqueta}</span>
      {children}
    </div>
  );
}
