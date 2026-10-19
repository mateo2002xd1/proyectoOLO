import type { CSSProperties } from 'react';

/**
 * Colores de las franjas GOV.CO de la cabecera y del pie.
 *
 * Sin color propio la franja es blanca y su texto (la fecha y la hora de arriba, el
 * «|» de abajo), azul (#0943B5): lo fija el CSS de `.olo-gov-banner` y
 * `.olo-gov-banner-bottom`. Con un color elegido en el editor, ese texto pasa a blanco
 * si el fondo es oscuro y se queda azul si es claro. Las marcas GOV.CO ya no van
 * dibujadas: son imágenes que se suben.
 *
 * Sin imports de la app a propósito: lo usan `header.tsx` y `footer.tsx` (ver
 * `tamanos-texto-menu.ts` por qué importa no colgar de `@/features/paginas`).
 */

export const TINTA_SOBRE_CLARO = '#0943B5';
export const TINTA_SOBRE_OSCURO = '#ffffff';

/** Luminancia relativa (WCAG) de un `#rgb` o `#rrggbb`; `null` si no es un hex. */
function luminancia(color: string): number | null {
  const hex = color.trim().replace(/^#/, '');
  const largo = /^[0-9a-f]{3}$/i.test(hex) ? hex.replace(/./g, (c) => c + c) : hex;
  if (!/^[0-9a-f]{6}$/i.test(largo)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const canal = parseInt(largo.slice(i, i + 2), 16) / 255;
    return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Si sobre `color` el texto tiene que ir en blanco. Un color que no es hex (un nombre
 * CSS) cuenta como oscuro: es lo habitual en una franja de gobierno. También lo usa el
 * «Carrusel de imágenes» para su título.
 */
export function esColorOscuro(color: string): boolean {
  const l = luminancia(color);
  return l === null || l < 0.4;
}

/** Estilo en línea de una franja GOV.CO. Vacío: nada (manda el CSS: blanco y azul). */
export function estiloDeFranjaGov(fondo?: string): CSSProperties | undefined {
  const color = fondo?.trim();
  if (!color) return undefined;
  return { backgroundColor: color, color: esColorOscuro(color) ? TINTA_SOBRE_OSCURO : TINTA_SOBRE_CLARO };
}
