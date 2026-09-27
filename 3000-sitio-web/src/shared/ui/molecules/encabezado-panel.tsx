import type { ReactNode } from 'react';

interface EncabezadoPanelProps {
  titulo: ReactNode;
  descripcion?: ReactNode;
  /** Botones de la derecha. En el móvil bajan debajo del texto. */
  acciones?: ReactNode;
  /** Margen inferior; `mb-6` si no se pasa. */
  className?: string;
}

/**
 * Título, descripción y acciones de cada pantalla del panel.
 *
 * Las ocho pantallas lo escribían a mano y no todas apilaban en el móvil: en
 * Usuarios y Roles el botón se quedaba al lado de un título de dos líneas y se
 * partía en «Crear / Usuario». Aquí, por debajo de `sm`, título y acciones van uno
 * debajo del otro; desde `sm`, en la misma fila.
 */
export function EncabezadoPanel({ titulo, descripcion, acciones, className = 'mb-6' }: EncabezadoPanelProps) {
  return (
    <div className={`flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center ${className}`}>
      <div className="min-w-0">
        <h1 className="admin-header text-zinc-950 dark:text-[#f6f6f6]">{titulo}</h1>
        {descripcion && (
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-[#94a3b8]">{descripcion}</p>
        )}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-3 sm:shrink-0">{acciones}</div>}
    </div>
  );
}
