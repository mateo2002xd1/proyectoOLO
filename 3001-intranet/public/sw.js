/**
 * Service worker de la intranet del OLO: lo que la hace instalable como app (PWA) y
 * muestra un aviso propio cuando no hay conexión.
 *
 * A diferencia del del sitio web, este NO guarda ninguna página ni ningún dato: todo
 * en la intranet es privado, y una copia guardada seguiría en el dispositivo después
 * de cerrar sesión, a la vista de quien use después el mismo equipo. Las páginas van
 * siempre a la red; sin red, se muestra la página sin conexión.
 *
 * Lo único que se guarda es lo que no es de nadie: `/_next/static/` (el código de la
 * app, que Next sirve sin sesión y con un hash en el nombre, así que la copia siempre
 * vale) y la propia página sin conexión con su ícono.
 *
 * Es JavaScript plano porque el navegador lo descarga tal cual, sin pasar por el build.
 * Por eso el prefijo de las cachés está copiado a mano de `shared/lib/pwa/pwa.ts`.
 *
 * Si un cambio aquí altera QUÉ se guarda, subir `VERSION`: al activarse, la versión
 * nueva borra las cachés de la anterior.
 */

const VERSION = "v1";
const PREFIJO = "olo-intranet-";
const CACHE_BASE = `${PREFIJO}base-${VERSION}`;
const CACHE_ESTATICOS = `${PREFIJO}estaticos-${VERSION}`;
const CACHES_VIGENTES = [CACHE_BASE, CACHE_ESTATICOS];

/**
 * Bajo `/assets/` porque `middleware.ts` ya deja pasar esa carpeta sin sesión: el
 * service worker la descarga al instalarse, cuando puede no haber sesión todavía.
 */
const PAGINA_SIN_CONEXION = "/assets/pwa/sin-conexion.html";

/** Se descarga al instalar: lo justo para poder decir «no hay conexión» sin red. */
const PRECACHE = [PAGINA_SIN_CONEXION, "/assets/pwa/icono-192.png"];

/**
 * Tope de entradas; al pasarlo se borran las más viejas. Sin tope, cada despliegue
 * dejaría sus archivos de `/_next/static/` para siempre en el dispositivo.
 */
const MAXIMO_ESTATICOS = 200;

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_BASE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      const nombres = await caches.keys();
      await Promise.all(
        nombres
          .filter((nombre) => nombre.startsWith(PREFIJO) && !CACHES_VIGENTES.includes(nombre))
          .map((nombre) => caches.delete(nombre)),
      );
      // Pide la página a la red mientras el service worker arranca, en vez de después:
      // sin esto, cada navegación espera primero a que él despierte.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (evento) => {
  const { request } = evento;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (PRECACHE.includes(url.pathname)) {
    evento.respondWith(primeroLaCopia(evento, CACHE_BASE));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    evento.respondWith(primeroLaCopia(evento, CACHE_ESTATICOS));
    return;
  }
  if (request.mode === "navigate") {
    evento.respondWith(soloLaRed(evento));
  }
  // Lo demás (datos, imágenes de `/uploads`, peticiones internas de Next) va a la red
  // sin tocarse y sin guardarse: exige sesión.
});

/** Nunca se guarda; sin red se avisa en vez de mostrar el error del navegador. */
async function soloLaRed(evento) {
  try {
    const precargada = await evento.preloadResponse;
    return precargada || (await fetch(evento.request));
  } catch {
    const pagina = await caches.match(PAGINA_SIN_CONEXION, { cacheName: CACHE_BASE });
    return pagina || Response.error();
  }
}

/** Solo archivos públicos cuyo contenido no cambia sin cambiar de nombre. */
async function primeroLaCopia(evento, nombreCache) {
  const copia = await caches.match(evento.request, { cacheName: nombreCache });
  if (copia) return copia;
  const respuesta = await fetch(evento.request);
  if (respuesta.status === 200 && respuesta.type === "basic") {
    evento.waitUntil(guardar(nombreCache, evento.request, respuesta.clone()));
  }
  return respuesta;
}

async function guardar(nombreCache, request, respuesta) {
  const cache = await caches.open(nombreCache);
  await cache.put(request, respuesta);
  if (nombreCache !== CACHE_ESTATICOS) return;
  // `keys()` devuelve en orden de guardado: lo primero es lo más viejo.
  const claves = await cache.keys();
  const sobrantes = claves.slice(0, Math.max(0, claves.length - MAXIMO_ESTATICOS));
  await Promise.all(sobrantes.map((clave) => cache.delete(clave)));
}
