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

/** Pie de las tablas: «Mostrando X-Y de Z» a la izquierda y, a la derecha,
 *  `Paginacion` (anterior, números, siguiente, «Ir a la página» y filas por
 *  página). Lo usan Roles, Usuarios, Actividad Reciente, Auditoría, Revisión y las
 *  tablas públicas con paginación. */
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
      <span className="text-xs text-zinc-500 dark:text-[#94a3b8]">
        Mostrando {desde}-{hasta} de {total} {etiqueta}
      </span>

      {/* «Filas por página» va a la derecha, tras «Ir a la página», con el borde y el
          alto de las casillas: se pinta aunque haya una sola página. */}
      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        onCambiarPagina={onCambiarPagina}
        tono={tono}
        ariaLabel={`Paginación de ${etiqueta}`}
        porPagina={{ valor: porPagina, opciones, onCambiar: onCambiarPorPagina }}
      />
    </div>
  );
}
