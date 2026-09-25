/**
 * Cómo se corresponden la URL de una sección y su slug, y a dónde vuelve el editor
 * cuando el usuario pulsa "Salir".
 *
 * **URL → slug.** El comodín `app/(secciones)/[...puckPath]` sirve cualquier
 * profundidad, pero el slug nunca lleva barra: la API expone `/paginas/publica/:slug`
 * y un parámetro de Express no cruza una barra. Por eso los segmentos se unen con
 * `-`: `/encuestas/calidad-de-formacion` es `encuestas-calidad-de-formacion`, que es
 * el slug real guardado en BD. La intranet no necesita carpetas por sección (a
 * diferencia del sitio, cuyo comodín `[slug]` solo cubre un segmento).
 *
 * **Slug → URL.** Al revés hay ambigüedad —`/encuestas-x` y `/encuestas/x` dan el
 * mismo slug y las dos abren la sección—, así que la URL canónica la fija la API, en
 * la rama intranet de `resolverHref` (`api-backend/src/shared/extraer-textos-puck.ts`):
 * lo que empieza por `encuestas-` cuelga de `/encuestas/`. `rutaPublicaDeSlug` es su
 * espejo; si una cambia, cambia la otra.
 *
 * **Ruta de vuelta.** El editor es una pantalla completa a la que se llega desde
 * varios sitios: el botón flotante de una sección, un panel de administración o un
 * enlace directo. La ruta de origen viaja en `?volver=`; `document.referrer` no sirve
 * porque se pierde en cuanto el editor recarga o navega.
 */

const PARAM = "volver";

const PREFIJO_ENCUESTAS = "encuestas-";

/** La URL canónica de una sección, a partir de su slug. */
export function rutaPublicaDeSlug(slug: string): string {
  return slug.startsWith(PREFIJO_ENCUESTAS)
    ? `/encuestas/${slug.slice(PREFIJO_ENCUESTAS.length)}`
    : `/${slug}`;
}

/**
 * El slug de la sección que se ve en una URL. Ignora `?…` y `#…` y la barra final;
 * la raíz es `inicio`.
 */
export function slugDeRutaPublica(ruta: string): string {
  const segmentos = ruta.split(/[?#]/)[0].split("/").filter(Boolean);
  return segmentos.length === 0 ? "inicio" : segmentos.join("-");
}

/**
 * Solo se aceptan rutas internas. Un `?volver=https://otro-sitio` convertiría el
 * botón de salir en un redirector abierto, y `//host` o `/\host` son la misma
 * trampa escrita de otra forma: el navegador las resuelve como absolutas.
 */
export function esRutaInternaSegura(ruta: string | null | undefined): ruta is string {
  return typeof ruta === "string" && /^\/(?![/\\])/.test(ruta);
}

/** Enlace al editor recordando desde dónde se abrió. */
export function enlaceAlEditor(slug: string, volverA: string): string {
  return `/editor/${slug}?${PARAM}=${encodeURIComponent(volverA)}`;
}

/**
 * Se lee en el momento del clic, no durante el render: así el componente no
 * tiene que sincronizar nada con la URL ni depender de `useSearchParams`.
 */
export function resolverRutaDeVuelta(rutaPorDefecto: string): string {
  if (typeof window === "undefined") return rutaPorDefecto;
  const volver = new URLSearchParams(window.location.search).get(PARAM);
  return esRutaInternaSegura(volver) ? volver : rutaPorDefecto;
}

/**
 * El slug de la sección desde la que se abrió "Menú y pie", a partir de `?volver=`.
 *
 * Se usa para traer esa sección como contexto de solo lectura en el editor de la
 * plantilla: sin `volver` válido (entrada directa a la URL, enlace copiado a mano)
 * cae a `inicio`, que siempre existe.
 */
export function slugDeOrigen(volver: string | null | undefined): string {
  if (!esRutaInternaSegura(volver)) return "inicio";
  return slugDeRutaPublica(volver);
}
