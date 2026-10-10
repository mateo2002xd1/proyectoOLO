import type { ReactNode } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface SeccionAcordeonProps {
  titulo: string;
  children: ReactNode;
  abiertaAlInicio?: boolean;
  /**
   * `tarjeta` (de serie): una sección de página con su caja, como los submódulos de
   * Actualizaciones. `anidada`: un grupo dentro de otra tarjeta, con borde fino, sin sombra
   * y más compacta (los grupos de colores de Configuración).
   */
  variante?: 'tarjeta' | 'anidada';
  /** El nivel del título. `h2` en la página; dentro de una sección con su `h2`, `h3` o `h4`. */
  nivel?: 'h2' | 'h3' | 'h4';
  /** Algo corto a la derecha del título, visible aunque esté plegada: «2 sin guardar». */
  detalle?: ReactNode;
}

const ESTILOS = {
  tarjeta: {
    caja: 'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f]',
    resumen: 'min-h-14 rounded-xl px-6 py-4 group-open:rounded-b-none',
    titulo: 'font-bold',
    contenido: 'border-t border-gray-200 px-6 pb-6 pt-5 dark:border-[#7db828]/30',
  },
  anidada: {
    caja: 'rounded-lg border border-gray-200 dark:border-[#2d3649]',
    resumen: 'min-h-12 rounded-lg px-4 py-3 group-open:rounded-b-none',
    titulo: 'text-sm font-semibold',
    contenido: 'border-t border-gray-200 p-3 sm:p-4 dark:border-[#2d3649]',
  },
};

/**
 * Una fila de acordeón: el título y una flecha a la vista, y al pulsar se despliega lo de
 * dentro. Nació en Actualizaciones; desde el 2026-10-10 vive aquí porque la usa también
 * Configuración (los grupos de colores de la identidad visual).
 *
 * `<details>` nativo, como los apartados de `detalle-ocupacion.tsx`: se abre con teclado
 * (Enter o Espacio sobre el título), el lector de pantalla anuncia si está abierto o
 * cerrado, y no hace falta estado. El contenido se monta aunque esté cerrado, así que lo que
 * tenga dentro (una carga, un formulario a medias) no se pierde al plegarlo.
 */
export function SeccionAcordeon({
  titulo,
  children,
  abiertaAlInicio = false,
  variante = 'tarjeta',
  nivel: Titulo = 'h2',
  detalle,
}: SeccionAcordeonProps) {
  const estilos = ESTILOS[variante];
  return (
    <details open={abiertaAlInicio} className={`group ${estilos.caja}`}>
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-3 transition-colors hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7DB728] dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden ${estilos.resumen}`}
      >
        <Titulo className={`text-[#001631] dark:text-[#f6f6f6] ${estilos.titulo}`}>{titulo}</Titulo>
        <span className="flex shrink-0 items-center gap-3">
          {detalle}
          <ChevronDownIcon
            aria-hidden="true"
            className="size-5 shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none dark:text-[#94a3b8]"
          />
        </span>
      </summary>
      <div className={estilos.contenido}>{children}</div>
    </details>
  );
}
