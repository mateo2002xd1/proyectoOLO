import type { MetadataRoute } from "next";

import { COLOR_PWA, ICONOS_PWA } from "@/shared/lib/pwa";

/**
 * Manifiesto de la PWA: lo que el navegador necesita para ofrecer «Instalar app».
 *
 * Next lo sirve en `/manifest.webmanifest` y pone el `<link rel="manifest">` en todas
 * las páginas por su cuenta. El navegador lo pide sin cookies, así que
 * `middleware.ts` lo deja pasar sin sesión: si no, recibiría el login en su lugar y la
 * intranet no se podría instalar. No lleva nada privado.
 *
 * `start_url` es `/inicio` y no `/` porque `/` solo decide entre `/inicio` y `/login`
 * (`app/page.tsx`), y `/inicio` sin sesión ya manda al login. `id` fijo para que el
 * navegador la siga reconociendo como la misma app aunque cambie `start_url`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Intranet | Observatorio Laboral y Ocupacional SENA",
    short_name: "Intranet OLO",
    description:
      "Información restringida para público interno del Observatorio Laboral y Ocupacional - SENA",
    lang: "es-CO",
    dir: "ltr",
    start_url: "/inicio",
    scope: "/",
    display: "standalone",
    background_color: COLOR_PWA,
    theme_color: COLOR_PWA,
    icons: ICONOS_PWA,
  };
}
