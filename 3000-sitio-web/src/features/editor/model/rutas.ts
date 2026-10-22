/**
 * A dónde vuelve el editor cuando el usuario pulsa "Salir".
 *
 * El editor es una pantalla completa a la que se llega desde varios sitios: el
 * botón de editar de una página, el panel de administración o el redirect del
 * login. La ruta de origen viaja en `?volver=`; `document.referrer` no sirve
 * porque se pierde en cuanto el editor recarga o navega.
 */

import { rutaDeSlug, type MapaDelMenu } from '@/shared/lib/rutas-del-menu';

const PARAM = 'volver';

/**
 * Solo se aceptan rutas internas. Un `?volver=https://otro-sitio` convertiría el
 * botón de salir en un redirector abierto, y `//host` o `/\host` son la misma
 * trampa escrita de otra forma: el navegador las resuelve como absolutas.
 */
export function esRutaInternaSegura(ruta: string | null | undefined): ruta is string {
  return typeof ruta === 'string' && /^\/(?![/\\])/.test(ruta);
}

/** Enlace al editor recordando desde dónde se abrió. */
export function enlaceAlEditor(slug: string, volverA: string): string {
  return `/edit/${slug}?${PARAM}=${encodeURIComponent(volverA)}`;
}

/**
 * La ruta pública de una página: la que le da el menú de «Menú y pie» o, si no está en él,
 * `/{slug}`.
 *
 * El slug es plano (`clasificacion-cuoc`) y la jerarquía de la URL sale del menú: una hija
 * de un desplegable cuelga de su tramo (`/clasificacion-de-las-ocupaciones/clasificacion-cuoc`).
 * Ver `shared/lib/rutas-del-menu`. Sin `mapa` (donde no se tiene el menú a mano: listados del
 * panel, el editor) devuelve `/{slug}`, y el sitio redirige esa URL a la ruta buena.
 *
 * La portada no es excepción: vive en `/inicio`, igual que su slug. Antes había un
 * caso especial que traducía `inicio` a `/` porque la portada estaba en la raíz,
 * pero eso servía el mismo contenido bajo dos URLs; ahora `/` redirige a `/inicio`
 * (ver `next.config.mjs`).
 */
export function rutaPublicaDeSlug(slug: string, mapa?: MapaDelMenu): string {
  return rutaDeSlug(slug, mapa);
}

/**
 * El slug de una ruta pública: su último tramo (`/padre/hija` → `hija`); la raíz es `inicio`.
 *
 * Es la inversa de `rutaPublicaDeSlug` para las rutas buenas. Las viejas de dos tramos
 * (`/clasificacion/cuoc`) las resuelve `slugsDeRutaPublica`.
 */
export function slugDeRutaPublica(ruta: string): string {
  const segmentos = ruta.split(/[?#]/)[0].split('/').filter(Boolean);
  return segmentos.length === 0 ? 'inicio' : segmentos[segmentos.length - 1];
}

/**
 * Los slugs que puede nombrar una URL, del más probable al menos.
 *
 * 1. El último tramo: `/padre/hija` → `hija`, la ruta que arma el menú.
 * 2. Todos los tramos unidos con guion: `/clasificacion/cuoc` → `clasificacion-cuoc`. Así se
 *    generaban las rutas de dos tramos antes de que las definiera el menú; hay enlaces
 *    guardados y de otros sitios con esa forma, y de este modo siguen llegando (la página
 *    los redirige a la ruta buena).
 */
export function slugsDeRutaPublica(segmentos: string[]): string[] {
  const ultimo = segmentos[segmentos.length - 1];
  if (!ultimo) return [];
  const unido = segmentos.join('-');
  return unido === ultimo ? [ultimo] : [ultimo, unido];
}

/**
 * Se lee en el momento del clic, no durante el render: así el componente no
 * tiene que sincronizar nada con la URL ni depender de `useSearchParams`.
 */
export function resolverRutaDeVuelta(rutaPorDefecto: string): string {
  if (typeof window === 'undefined') return rutaPorDefecto;
  const volver = new URLSearchParams(window.location.search).get(PARAM);
  return esRutaInternaSegura(volver) ? volver : rutaPorDefecto;
}

/**
 * El slug de la página desde la que se abrió "Menú y pie", a partir de `?volver=`.
 *
 * Se usa para traer esa página como contexto de solo lectura en el editor de la
 * plantilla: sin `volver` válido (entrada directa a la URL, enlace copiado a mano)
 * cae a `inicio`, que siempre existe.
 */
export function slugDeOrigen(volver: string | null | undefined): string {
  if (!esRutaInternaSegura(volver)) return 'inicio';
  return slugDeRutaPublica(volver);
}
