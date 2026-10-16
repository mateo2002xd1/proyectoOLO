/**
 * Service worker del sitio web del OLO: lo que deja abrir el sitio sin conexión una vez
 * instalado como app (PWA).
 *
 * Regla general: con internet todo sale de la red, igual que sin service worker, y lo
 * guardado solo se usa cuando la red falla. El sitio lo editan personas que publican y
 * recargan esperando ver su cambio: servir primero la copia les mostraría la versión
 * anterior. La única excepción es `/_next/static/`: Next pone un hash en el nombre de
 * cada archivo, así que un nombre nunca cambia de contenido y la copia siempre vale.
 *
 * Lo privado no se guarda nunca: el panel, el editor, la vista previa, las pantallas de
 * acceso y `/api` van solo a la red. De respaldo, tampoco se guarda ninguna respuesta
 * que diga `no-store` o `private` (así marca Next las páginas que leen la sesión), por
 * si mañana aparece una ruta privada que no está en `RUTAS_PRIVADAS`.
 *
 * Es JavaScript plano porque el navegador lo descarga tal cual, sin pasar por el build.
 * Por eso el prefijo de las cachés está copiado a mano de `shared/lib/pwa/pwa.ts`.
 *
 * Si un cambio aquí altera QUÉ se guarda, subir `VERSION`: al activarse, la versión
 * nueva borra las cachés de la anterior.
 */

const VERSION = 'v1';
const PREFIJO = 'olo-sitio-';
const CACHE_BASE = `${PREFIJO}base-${VERSION}`;
const CACHE_ESTATICOS = `${PREFIJO}estaticos-${VERSION}`;
const CACHE_PAGINAS = `${PREFIJO}paginas-${VERSION}`;
const CACHE_IMAGENES = `${PREFIJO}imagenes-${VERSION}`;
const CACHES_VIGENTES = [CACHE_BASE, CACHE_ESTATICOS, CACHE_PAGINAS, CACHE_IMAGENES];

const PAGINA_SIN_CONEXION = '/assets/pwa/sin-conexion.html';

/** Se descarga al instalar: lo justo para poder decir «no hay conexión» sin red. */
const PRECACHE = [PAGINA_SIN_CONEXION, '/assets/pwa/icono-192.png'];

/**
 * Tope de entradas por caché; al pasarlo se borran las más viejas. Sin tope, cada
 * despliegue dejaría sus archivos de `/_next/static/` para siempre en el dispositivo.
 */
const MAXIMO_POR_CACHE = {
  [CACHE_ESTATICOS]: 200,
  [CACHE_PAGINAS]: 50,
  [CACHE_IMAGENES]: 80,
};

/** `app/admin`, `app/editor`, `app/preview`, las pantallas de `app/(auth)` y `app/api`. */
const RUTAS_PRIVADAS = [
  '/admin',
  '/editor',
  '/preview',
  '/api',
  '/api-backend',
  // Cubre también los pasos del acceso, que cuelgan de él (`/login/first-login`,
  // `/login/recovery`...).
  '/login',
  // URLs de antes del 2026-10-15, que ahora redirigen a `/login/...`.
  '/first-login',
  '/recovery',
  '/security-questions',
  '/reset-password',
  '/reset-success',
];

const esPrivada = (ruta) => RUTAS_PRIVADAS.some((p) => ruta === p || ruta.startsWith(`${p}/`));

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_BASE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
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

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (PRECACHE.includes(url.pathname)) {
    evento.respondWith(primeroLaCopia(evento, CACHE_BASE));
    return;
  }
  if (url.pathname.startsWith('/_next/static/')) {
    evento.respondWith(primeroLaCopia(evento, CACHE_ESTATICOS));
    return;
  }
  if (request.mode === 'navigate') {
    evento.respondWith(
      esPrivada(url.pathname) ? soloLaRed(evento) : primeroLaRed(evento, CACHE_PAGINAS),
    );
    return;
  }
  if (request.destination === 'image' && !esPrivada(url.pathname)) {
    evento.respondWith(primeroLaRed(evento, CACHE_IMAGENES));
  }
  // Lo demás va a la red sin tocarse: los datos de la API, las peticiones internas de
  // navegación de Next (RSC) y los documentos. Si una petición RSC falla por falta de
  // red, Next recarga la página entera, y esa recarga sí pasa por `primeroLaRed`.
});

/** La precarga si la hubo; si no, la red. Lanza si no hay conexión. */
async function pedirALaRed(evento) {
  const precargada = await evento.preloadResponse;
  return precargada || fetch(evento.request);
}

/** Red, guardando copia; sin red, la copia; sin copia, la página sin conexión. */
async function primeroLaRed(evento, nombreCache) {
  try {
    const respuesta = await pedirALaRed(evento);
    if (sePuedeGuardar(respuesta)) {
      evento.waitUntil(guardar(nombreCache, evento.request, respuesta.clone()));
    }
    return respuesta;
  } catch (error) {
    const copia = await caches.match(evento.request, { cacheName: nombreCache });
    if (copia) return copia;
    if (evento.request.mode === 'navigate') return paginaSinConexion();
    throw error;
  }
}

/** Solo archivos cuyo contenido no cambia sin cambiar de nombre. */
async function primeroLaCopia(evento, nombreCache) {
  const copia = await caches.match(evento.request, { cacheName: nombreCache });
  if (copia) return copia;
  const respuesta = await fetch(evento.request);
  if (sePuedeGuardar(respuesta)) {
    evento.waitUntil(guardar(nombreCache, evento.request, respuesta.clone()));
  }
  return respuesta;
}

/** Para lo privado: nunca se guarda, y sin red se avisa en vez del error del navegador. */
async function soloLaRed(evento) {
  try {
    return await pedirALaRed(evento);
  } catch {
    return paginaSinConexion();
  }
}

async function paginaSinConexion() {
  const pagina = await caches.match(PAGINA_SIN_CONEXION, { cacheName: CACHE_BASE });
  return pagina || Response.error();
}

/**
 * Solo respuestas 200 del propio sitio. Un 206 (fragmento de un video) no se puede
 * guardar, y una redirección o un error no son la página que se pidió.
 */
function sePuedeGuardar(respuesta) {
  if (respuesta.status !== 200 || respuesta.type !== 'basic') return false;
  const cacheControl = respuesta.headers.get('Cache-Control') || '';
  return !/no-store|private/i.test(cacheControl);
}

async function guardar(nombreCache, request, respuesta) {
  const cache = await caches.open(nombreCache);
  await cache.put(request, respuesta);
  const maximo = MAXIMO_POR_CACHE[nombreCache];
  if (!maximo) return;
  // `keys()` devuelve en orden de guardado y `put` sobre una clave existente la manda
  // al final: lo primero de la lista es lo que hace más tiempo que no se guarda.
  const claves = await cache.keys();
  const sobrantes = claves.slice(0, Math.max(0, claves.length - maximo));
  await Promise.all(sobrantes.map((clave) => cache.delete(clave)));
}
