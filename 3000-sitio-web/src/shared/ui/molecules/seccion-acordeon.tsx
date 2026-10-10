import type { ReactNode } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface SeccionAcordeonProps {
  titulo: string;
  children: ReactNode;
  abiertaAlInicio?: boolean;
}

/**
 * Un submódulo de Actualizaciones como fila de acordeón: el título y una flecha a la vista,
 * y al pulsar se despliegan sus opciones (formato, carga, historial).
 *
 * `<details>` nativo, como los apartados de `detalle-ocupacion.tsx`: se abre con teclado
 * (Enter o Espacio sobre el título), el lector de pantalla anuncia si está abierto o
 * cerrado, y no hace falta estado. El contenido se monta aunque esté cerrado, así que cada
 * tarjeta empieza a traer su historial sin esperar a que la abran.
 */
export function SeccionAcordeon({ titulo, children, abiertaAlInicio = false }: SeccionAcordeonProps) {
  return (
    <details
      open={abiertaAlInicio}
      className="group rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f]"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-6 py-4 transition-colors hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7DB728] group-open:rounded-b-none dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden">
        <h2 className="font-bold text-[#001631] dark:text-[#f6f6f6]">{titulo}</h2>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-5 shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none dark:text-[#94a3b8]"
        />
      </summary>
      <div className="border-t border-gray-200 px-6 pb-6 pt-5 dark:border-[#7db828]/30">{children}</div>
    </details>
  );
}
