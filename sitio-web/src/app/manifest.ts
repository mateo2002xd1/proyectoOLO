import type { MetadataRoute } from 'next';

import { COLOR_PWA, ICONOS_PWA } from '@/shared/lib/pwa';

/**
 * Manifiesto de la PWA: lo que el navegador necesita para ofrecer «Instalar app».
 *
 * Next lo sirve en `/manifest.webmanifest` y pone el `<link rel="manifest">` en todas
 * las páginas por su cuenta. El resto de la PWA es `public/sw.js` (lo que funciona sin
 * conexión) y `RegistrarServiceWorker` (lo que lo instala).
 *
 * `start_url` es `/inicio` y no `/` porque `/` redirige ahí (`next.config.mjs`): así
 * la app abre sin un salto de más. `id` fijo para que el navegador la siga
 * reconociendo como la misma app instalada aunque algún día cambie `start_url`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Observatorio Laboral y Ocupacional SENA',
    short_name: 'OLO SENA APP',
    description:
      'Datos y análisis del mercado laboral colombiano: ocupaciones, sectores productivos y tendencias de empleo.',
    lang: 'es-CO',
    dir: 'ltr',
    start_url: '/inicio',
    scope: '/',
    display: 'standalone',
    background_color: COLOR_PWA,
    theme_color: COLOR_PWA,
    icons: ICONOS_PWA,
  };
}
