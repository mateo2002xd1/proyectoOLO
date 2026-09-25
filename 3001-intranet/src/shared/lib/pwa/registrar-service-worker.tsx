"use client";

import { useEffect } from "react";

import { PREFIJO_CACHES_PWA, RUTA_SERVICE_WORKER } from "./pwa";

/**
 * Instala `public/sw.js`, que es lo que hace instalable la intranet y muestra un
 * aviso propio cuando no hay conexión.
 *
 * Solo en producción. Si en este mismo puerto alguna vez se probó un build de
 * producción, su service worker sigue instalado en el navegador, así que en
 * desarrollo se desinstala y se borran sus cachés.
 *
 * `updateViaCache: "none"`: el navegador consulta `sw.js` al servidor en cada visita
 * en vez de fiarse de su caché HTTP, así que una versión nueva se instala enseguida.
 */
export function RegistrarServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void desinstalar();
      return;
    }

    navigator.serviceWorker
      .register(RUTA_SERVICE_WORKER, { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Sin service worker la intranet funciona igual; solo pierde la instalación y
        // el aviso sin conexión. No hay nada que mostrarle a quien la usa.
      });
  }, []);

  return null;
}

async function desinstalar() {
  const registros = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registros.map((registro) => registro.unregister()));
  if (!("caches" in window)) return;
  const nombres = await caches.keys();
  await Promise.all(
    nombres.filter((nombre) => nombre.startsWith(PREFIJO_CACHES_PWA)).map((nombre) => caches.delete(nombre)),
  );
}
