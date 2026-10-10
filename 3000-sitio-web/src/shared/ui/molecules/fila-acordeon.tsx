'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

/**
 * Las piezas de una tabla en acordeón (`olo-tabla-apilable olo-tabla-acordeon`, reglas en
 * globals.css): en el móvil y la tablet cada fila es una frase que se despliega; en
 * escritorio sigue la tabla. Pedido del usuario el 2026-10-09 para «Páginas en revisión»
 * y llevado después a las demás listas.
 *
 * Una fila se arma así:
 *
 * - `<tr data-abierta={abierta || undefined}>`
 * - `<td data-resumen>` con `<ResumenDeFila>`: la frase. Plegada, la corta; desplegada,
 *   la frase entera (el usuario vio «muy saturada» la ficha de datos con etiquetas).
 * - `<td data-detalle>`: lo que se añade al desplegar, sin etiqueta (un comentario, un
 *   botón con nombre).
 * - `data-solo-tabla` en las celdas que la frase ya cuenta.
 */

/** Qué filas están desplegadas. Pueden estarlo varias a la vez. */
export function useFilasAbiertas() {
  const [abiertas, setAbiertas] = useState<ReadonlySet<string>>(() => new Set());
  const alternar = useCallback(
    (id: string) =>
      setAbiertas((previas) => {
        const nuevas = new Set(previas);
        if (nuevas.has(id)) nuevas.delete(id);
        else nuevas.add(id);
        return nuevas;
      }),
    [],
  );
  return { estaAbierta: (id: string) => abiertas.has(id), alternar };
}

/** Lo que se destaca dentro de la frase: quién, qué y cuándo. */
export const RESALTE_DE_FILA = 'font-semibold text-zinc-900 dark:text-[#f6f6f6]';

/**
 * La fecha dentro de la frase: «9 de octubre de 2026 a las 5:30 p. m.». Va en la frase
 * desplegada, no en la corta.
 */
export function fechaDeFila(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

/** El botón de la fila en acordeón: la frase y la flecha que gira. 44 px de alto mínimo. */
export function ResumenDeFila({
  abierta,
  onAlternar,
  children,
}: {
  abierta: boolean;
  onAlternar: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-expanded={abierta}
      onClick={onAlternar}
      className="flex min-h-11 w-full items-center gap-3 rounded-[16px] py-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#001631] dark:focus-visible:ring-white"
    >
      <span className="min-w-0 flex-1 text-sm leading-5 text-zinc-600 dark:text-zinc-300">{children}</span>
      <ChevronDownIcon
        aria-hidden="true"
        className={`size-5 shrink-0 text-zinc-500 transition-transform duration-200 motion-reduce:transition-none dark:text-zinc-400 ${abierta ? 'rotate-180' : ''}`}
      />
    </button>
  );
}
