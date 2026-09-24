'use client';

import { Paginacion } from './paginacion';

/** Tamaños de página que ofrece el desplegable, en todas las tablas del panel. */
export const OPCIONES_POR_PAGINA = [15, 30, 60, 100] as const;

interface PaginadorProps {
  /** Página actual, en base 1. */
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
  /** Total de elementos sin paginar, para el texto "Mostrando X-Y de Z". */
  total: number;
  porPagina: number;
  onCambiarPorPagina: (porPagina: number) => void;
  /** Sustantivo en plural para el texto: "usuarios", "roles", "registros". */
  etiqueta: string;
  tono?: 'panel' | 'publico';
  opciones?: readonly number[];
  className?: string;
}

/** Pie de las tablas del panel: «Mostrando X-Y de Z», filas por página y, a la
 *  derecha, `Paginacion` (la misma de las tablas públicas, con la paleta del
 *  panel). Lo usan Roles, Usuarios, Actividad Reciente, Auditoría y Revisión. */
export function Paginador({
  pagina,
  totalPaginas,
  onCambiarPagina,
  total,
  porPagina,
  onCambiarPorPagina,
  etiqueta,
  tono = 'panel',
  opciones = OPCIONES_POR_PAGINA,
  className = '',
}: PaginadorProps) {
  if (total === 0) return null;

  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  return (
    // El padding horizontal no trae valor por defecto: dos clases `px-*` en el
    // mismo elemento compiten por orden de aparición en el CSS generado, no por
    // orden en el atributo `class`, así que un valor por defecto aquí no se deja
    // pisar de forma confiable por `className`. Cada tabla pasa el suyo.
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 py-3 dark:border-zinc-800 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xs text-zinc-500 dark:text-[#94a3b8]">
          Mostrando {desde}-{hasta} de {total} {etiqueta}
        </span>
        <label className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#94a3b8]">
          Filas por página
          <select
            value={porPagina}
            onChange={(e) => onCambiarPorPagina(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-[#131b2f] dark:text-zinc-200 dark:focus:border-white dark:focus:ring-white"
          >
            {opciones.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {totalPaginas > 1 && (
        <Paginacion
          pagina={pagina}
          totalPaginas={totalPaginas}
          onCambiarPagina={onCambiarPagina}
          tono={tono}
          ariaLabel={`Paginación de ${etiqueta}`}
        />
      )}
    </div>
  );
}
