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
  return `/editor/${slug}?${PARAM}=${encodeURIComponent(volverA)}`;
}

/**
 * Páginas que no viven en `/{slug}` sino en una carpeta propia de `app/(public)/`.
 *
 * El slug es la llave de todo lo demás —el contenido en `paginas`, el permiso
 * `editar.sitio.{slug}`, el contador de visitas, la etiqueta de caché—, así que mover
 * una página de carpeta no lo cambia: cambia solo su URL, y esta tabla traduce entre
 * las dos. **Al mover una página a una subcarpeta hay que añadirla aquí.** Si no, el
 * botón de editar, el de eliminar y el contador de visitas sacan el slug de la URL con
 * la regla general (segmentos unidos con guion) y apuntan a una página que no existe.
 *
 * El buscador arma sus enlaces en la API, así que la API lleva su propia copia de
 * esta tabla (`resolverHref` en `api-backend/src/shared/extraer-textos-puck.ts`). La
 * URL vieja queda redirigida en `next.config.mjs` para los enlaces ya repartidos.
 */
const RUTAS_PROPIAS: Record<string, string> = {
  cno: '/clasificacion/cno',
  cuoc: '/clasificacion/cuoc',
};

const SLUG_DE_RUTA_PROPIA = new Map(
  Object.entries(RUTAS_PROPIAS).map(([slug, ruta]) => [ruta, slug])
);

/**
 * La ruta pública de un slug.
 *
 * La portada no es excepción: vive en `/inicio`, igual que su slug. Antes había un
 * caso especial que traducía `inicio` a `/` porque la portada estaba en la raíz,
 * pero eso servía el mismo contenido bajo dos URLs; ahora `/` redirige a `/inicio`
 * (ver `next.config.mjs`).
 */
export function rutaPublicaDeSlug(slug: string): string {
  return RUTAS_PROPIAS[slug] ?? `/${slug}`;
}

/**
 * El slug de una ruta pública: el inverso de `rutaPublicaDeSlug`.
 *
 * Fuera de `RUTAS_PROPIAS` rige la regla general: los segmentos unidos con guion
 * (`/encuestas/tasa` → `encuestas-tasa`) y la raíz es `inicio`.
 */
export function slugDeRutaPublica(ruta: string): string {
  const limpia = ruta.split(/[?#]/)[0].replace(/\/+$/, '');
  const propia = SLUG_DE_RUTA_PROPIA.get(limpia);
  if (propia) return propia;
  const segmentos = limpia.split('/').filter(Boolean);
  return segmentos.length === 0 ? 'inicio' : segmentos.join('-');
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
