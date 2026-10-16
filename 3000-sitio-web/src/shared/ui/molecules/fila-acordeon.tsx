'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { CONTORNO_DE_ETIQUETA_EN_OSCURO } from '@/shared/ui/atoms/etiqueta';

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

/**
 * La fecha en una celda de la tabla (escritorio): el día arriba y la hora debajo, más
 * pequeña y fina. Pedido del usuario el 2026-10-12 en «Páginas en revisión» y Respaldos.
 * `font-light` (300) y no `font-thin`: Poppins se carga en 300–700 (`shared/lib/fonts.ts`)
 * y el 100 caería en el mismo 300.
 *
 * `exacta`: «12/10/2026» y «5:30:15 p. m.», con segundos, para Auditoría, donde el orden
 * exacto de los sucesos importa. Sin ella, «12 oct 2026» y «5:30 p. m.».
 */
export function FechaDeCelda({ iso, exacta = false }: { iso: string; exacta?: boolean }) {
  let dia = iso;
  let hora = '';
  try {
    const d = new Date(iso);
    dia = exacta ? d.toLocaleDateString('es-CO') : d.toLocaleDateString('es-CO', { dateStyle: 'medium' });
    hora = exacta ? d.toLocaleTimeString('es-CO') : d.toLocaleTimeString('es-CO', { timeStyle: 'short' });
  } catch {
    // Fecha ilegible: se muestra tal cual llegó.
  }
  return (
    <>
      <p className="text-sm">{dia}</p>
      {hora && <p className="text-xs font-light">{hora}</p>}
    </>
  );
}

/**
 * La columna «Página» de Respaldos y Páginas en revisión: arriba el portal en su píldora (Intranet en
 * `#001631`, Sitio web en `#EBF6E6`) y debajo, como la hora de `FechaDeCelda`, más pequeño
 * y fino, «menu-y-pie · versión 28» (pedido del usuario, 2026-10-15). Sin `ambito` no hay
 * píldora; sin `version`, solo la ruta. En modo oscuro, con el contorno claro de las
 * etiquetas: la de Intranet se fundía con el fondo de la tabla.
 */
export function CeldaDePagina({
  ambito,
  slug,
  version,
}: {
  ambito?: string | null;
  slug: string;
  version?: number | null;
}) {
  return (
    <>
      {ambito && (
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ${CONTORNO_DE_ETIQUETA_EN_OSCURO} ${
            ambito === 'intranet' ? 'bg-[#001631] text-white' : 'bg-[#EBF6E6] text-[#7DB728]'
          }`}
        >
          {ambito === 'intranet' ? 'Intranet' : 'Sitio web'}
        </span>
      )}
      <p className="mt-1 text-xs font-light">
        {slug}
        {version != null && ` · versión ${version}`}
      </p>
    </>
  );
}

/**
 * Un botón de la fila desplegada (en `td[data-detalle]`): icono y nombre, a todo el ancho de
 * su hueco y 44 px de alto. En la tabla esas acciones son iconos con tooltip, que en una
 * pantalla táctil no se ven. `color`: la clase de `COLOR_DE_ACCION`, la que se configura en
 * Identidad visual. Varios van en `<div className="grid grid-cols-2 gap-2">`.
 */
export function BotonDeFila({
  color,
  onClick,
  disabled,
  children,
}: {
  color: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-[16px] px-3 text-sm font-medium transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#001631] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100 dark:focus-visible:ring-white ${color}`}
    >
      {children}
    </button>
  );
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
