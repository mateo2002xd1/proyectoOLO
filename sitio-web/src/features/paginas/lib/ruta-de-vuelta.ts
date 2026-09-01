/**
 * A dónde vuelve el editor cuando el usuario pulsa "Salir".
 *
 * El editor es una pantalla completa a la que se llega desde varios sitios: el
 * botón de editar de una página, el panel de administración o el redirect del
 * login. La ruta de origen viaja en `?volver=`; `document.referrer` no sirve
 * porque se pierde en cuanto el editor recarga o navega.
 */

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
  return `/admin/editor/${slug}?${PARAM}=${encodeURIComponent(volverA)}`;
}

/**
 * La ruta pública de un slug.
 *
 * Ya no hay ninguna excepción: la portada vive en `/inicio`, igual que su slug.
 * Antes había un caso especial que traducía `inicio` a `/` porque la portada
 * estaba en la raíz, pero eso servía el mismo contenido bajo dos URLs; ahora `/`
 * redirige a `/inicio` (ver `next.config.mjs`).
 */
export function rutaPublicaDeSlug(slug: string): string {
  return `/${slug}`;
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
  const slug = volver.replace(/^\/+/, '').replace(/\/+$/, '');
  return slug || 'inicio';
}
