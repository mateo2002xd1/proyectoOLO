import type { CSSProperties } from 'react';

/**
 * Cómo se reparten las imágenes de las franjas GOV.CO (cabecera y pie): su
 * alineación, la separación entre ellas y el relleno de la caja de cada una.
 *
 * La separación es una escala con nombre y no un número de px porque tiene que
 * acompañar al ancho de la pantalla: cada paso es un `clamp(mínimo, vw, máximo)`,
 * estrecho en el celular y más holgado en el computador.
 *
 * Sin imports de la app a propósito: lo usan `header.tsx`, `footer.tsx`,
 * `campos-del-pie.ts` y `puck.config.tsx` al cargarse (ver `tamanos-texto-menu.ts`).
 */

export const SEPARACIONES_FRANJA: Record<string, { label: string; valor: string }> = {
  pequena: { label: 'Pequeña (8–16 px)', valor: 'clamp(8px, 1.5vw, 16px)' },
  mediana: { label: 'Mediana (12–32 px)', valor: 'clamp(12px, 3vw, 32px)' },
  grande: { label: 'Grande (16–64 px)', valor: 'clamp(16px, 5vw, 64px)' },
  'muy-grande': { label: 'Muy grande (24–120 px)', valor: 'clamp(24px, 8vw, 120px)' },
};

export const ALINEACIONES_FRANJA: Record<string, { label: string; valor: string }> = {
  izquierda: { label: 'Izquierda', valor: 'flex-start' },
  centro: { label: 'Centro', valor: 'center' },
  derecha: { label: 'Derecha', valor: 'flex-end' },
};

export const ENLACE_GOV_CO = 'https://www.gov.co';

/**
 * El enlace de la imagen de GOV.CO: lo que se escribió en el editor si es una dirección
 * web (`https://`, `http://`) o una ruta del sitio (`/…`); si no —vacío, o un
 * `javascript:` colado—, gov.co.
 */
export function enlaceDeGovCo(enlace?: string): string {
  const limpio = enlace?.trim() ?? '';
  return /^(https?:\/\/|\/(?!\/))/i.test(limpio) ? limpio : ENLACE_GOV_CO;
}

type Margen = number | '' | undefined;

/**
 * Relleno arriba y abajo de la caja (`.olo-franja-imagen`) de una imagen de franja.
 * Un margen vacío (borrado en el editor, que lo guarda como `''`) o sin guardar usa
 * el de `porDefecto`; los demás se recortan a 0–40 px, el alto de la franja.
 */
export function rellenoDeImagenDeFranja([arriba, abajo]: [Margen, Margen], porDefecto: [number, number]): CSSProperties {
  const px = (valor: Margen, respaldo: number) =>
    `${typeof valor === 'number' && Number.isFinite(valor) ? Math.min(Math.max(valor, 0), 40) : respaldo}px`;
  return { paddingTop: px(arriba, porDefecto[0]), paddingBottom: px(abajo, porDefecto[1]) };
}
