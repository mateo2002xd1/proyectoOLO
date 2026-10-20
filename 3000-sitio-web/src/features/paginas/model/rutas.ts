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
 * Las carpetas del sitio: un slug `{carpeta}-{resto}` vive en `/{carpeta}/{resto}`.
 *
 * Todas las páginas las sirve el comodín `app/(paginas)/[...puckPath]`, que une los
 * segmentos de la URL con guion para sacar el slug (`/clasificacion/cno` →
 * `clasificacion-cno`). Esa ida no necesita nada; la vuelta sí, porque un guion no dice
 * si separa carpetas o palabras: `clasificacion-cno` podría ser `/clasificacion-cno`.
 * Esta lista lo decide. Es la misma regla que la intranet aplica a `encuestas-`.
 *
 * Una página nueva dentro de una carpeta que ya está aquí no toca código: basta con que
 * su slug empiece por `{carpeta}-`. Solo una carpeta nueva se añade a esta lista y a su
 * copia de la API (`CARPETAS` en `api-backend/src/shared/extraer-textos-puck.ts`), que
 * es la que arma los enlaces del buscador.
 */
const CARPETAS = ['clasificacion'];

/**
 * La ruta pública de un slug.
 *
 * La portada no es excepción: vive en `/inicio`, igual que su slug. Antes había un
 * caso especial que traducía `inicio` a `/` porque la portada estaba en la raíz,
 * pero eso servía el mismo contenido bajo dos URLs; ahora `/` redirige a `/inicio`
 * (ver `next.config.mjs`).
 */
export function rutaPublicaDeSlug(slug: string): string {
  const carpeta = CARPETAS.find((c) => slug.startsWith(`${c}-`));
  return carpeta ? `/${carpeta}/${slug.slice(carpeta.length + 1)}` : `/${slug}`;
}

/**
 * El slug de una ruta pública: el inverso de `rutaPublicaDeSlug`.
 *
 * Los segmentos unidos con guion (`/clasificacion/cno` → `clasificacion-cno`) y la
 * raíz es `inicio`. Es la misma cuenta que hace el comodín `[...puckPath]`.
 */
export function slugDeRutaPublica(ruta: string): string {
  const segmentos = ruta.split(/[?#]/)[0].split('/').filter(Boolean);
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
