import type { MetadataRoute } from 'next';

/**
 * Lo que comparten el manifiesto (`app/manifest.ts`), el `<head>` (`app/layout.tsx`)
 * y el registro del service worker. `public/sw.js` no puede importar de aquí —el
 * navegador lo descarga tal cual, sin pasar por el build—, así que sus rutas y el
 * prefijo de sus cachés están escritos a mano allí y deben coincidir con estos.
 */

/**
 * Azul institucional del fondo de los íconos. También es el color de la barra de la
 * app instalada y el de la pantalla de arranque, para que esta se vea como el ícono
 * agrandado. Blanco encima: 17:1.
 */
export const COLOR_PWA = '#001A39';

/** Donde está el service worker. En la raíz para que su alcance cubra todo el sitio. */
export const RUTA_SERVICE_WORKER = '/sw.js';

/** Prefijo de las cachés que crea `public/sw.js`. */
export const PREFIJO_CACHES_PWA = 'olo-sitio-';

/**
 * Generados a partir de `assets/svg/favicon.svg` (el logo en blanco) sobre
 * `COLOR_PWA`. El enmascarable deja el logo dentro del círculo central del 80 %,
 * que es lo que Android conserva al recortarlo en círculo, gota o cuadrado.
 */
export const ICONOS_PWA: MetadataRoute.Manifest['icons'] = [
  { src: '/assets/pwa/icono-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/assets/pwa/icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  {
    src: '/assets/pwa/icono-enmascarable-512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable',
  },
];

/** iOS no lee los íconos del manifiesto: usa este, sin transparencia y a 180 px. */
export const ICONO_APPLE = '/assets/pwa/icono-apple-180.png';
