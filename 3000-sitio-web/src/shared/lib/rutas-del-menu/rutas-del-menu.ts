import type { ReactNode } from 'react';
import { esSlugValido, slugificar } from '@olo/slug-policy';

/**
 * Las rutas del sitio salen del menú de «Menú y pie», no de una lista escrita en el código.
 *
 * El slug de una página es plano (`clasificacion-cuoc`): la API lo expone como
 * `/paginas/publica/:slug` y un parámetro de Express no cruza una barra. La URL, en cambio,
 * la arma el menú:
 *
 *  - Un enlace suelto del menú vive en `/{slug}`.
 *  - Un desplegable crea un tramo con su nombre (`Clasificación de las Ocupaciones` →
 *    `/clasificacion-de-las-ocupaciones`) y cada hija cuelga de él:
 *    `/clasificacion-de-las-ocupaciones/clasificacion-cuoc`. El desplegable no es una página,
 *    solo el tramo y el botón que abre el submenú.
 *  - Una página que no está en el menú vive en `/{slug}`.
 *  - Una hija puede declarar `internas`: páginas que no salen en el menú y cuelgan de ella
 *    (`/clasificacion-de-las-ocupaciones/clasificacion-nacional-de-ocupaciones/resultado`).
 *    Es la única forma de que una página sea padre de otra: el desplegable no es página.
 *
 * Así crear una página desde el editor y ponerla bajo un desplegable basta para que tenga su
 * ruta con padre, sin tocar código ni desplegar.
 *
 * Esta pieza es pura (sin React ni Next) porque la usan la página que sirve cada URL, la
 * cabecera, las migas de pan y el buscador de la portada.
 */

/** Lo que se necesita de un enlace del menú (`NavItem` en `blocks/header.tsx`). */
export interface EnlaceDelMenu {
  label?: ReactNode;
  href?: string;
  children?: EnlaceDelMenu[];
  /** Solo en las hijas de un desplegable: páginas que cuelgan de esta y no se pintan en el menú. */
  internas?: EnlaceDelMenu[];
}

/** Dónde está una página en el menú. */
export interface PaginaDelMenu {
  slug: string;
  /** La ruta de verdad, sin `?` ni `#`. */
  ruta: string;
  /** Cómo la llama el menú; `null` si el rótulo no es texto (no se puede repetir en las migas). */
  nombre: string | null;
  /** La ruta de la página de la que cuelga, si es una `interna` de otra. */
  padre?: string;
}

export interface MapaDelMenu {
  /** Slug → su sitio en el menú. Si aparece dos veces, vale la primera. */
  porSlug: Map<string, PaginaDelMenu>;
  /** Ruta → su sitio en el menú. */
  porRuta: Map<string, PaginaDelMenu>;
  /** `/tramo` → nombre del desplegable que lo crea. */
  desplegables: Map<string, string>;
}

/** Solo valen los rótulos de texto; un rótulo con marcado no se puede repetir en otro sitio. */
const texto = (rotulo?: ReactNode): string | null =>
  typeof rotulo === 'string' && rotulo.trim() ? rotulo.trim() : null;

/** Separa la ruta de lo que la sigue (`?consulta`, `#ancla`). */
function partir(href?: string | null): [ruta: string, resto: string] {
  if (typeof href !== 'string') return ['', ''];
  const limpio = href.trim();
  const corte = limpio.search(/[?#]/);
  return corte === -1 ? [limpio, ''] : [limpio.slice(0, corte), limpio.slice(corte)];
}

/**
 * El slug de la página a la que lleva un enlace interno: sus tramos unidos con guion.
 *
 * `/clasificacion-cuoc` y `/clasificacion/cuoc` dan el mismo (`clasificacion-cuoc`): así
 * se escribían antes los enlaces a las páginas con carpeta, y los menús ya guardados en la
 * base siguen valiendo. `null` si no es un enlace interno (`#`, `https://…`, `mailto:`) o
 * si es la raíz.
 *
 * `tramos` son los tramos que crean los desplegables del menú. Quien edita suele pegar la
 * ruta tal como la ve en el navegador (`/clasificacion-de-las-ocupaciones/cuoc`): si su
 * primer tramo es uno de esos, es el del desplegable y no parte del slug, que es lo que queda
 * (`cuoc`). Sin esto se unirían todos y saldría un slug que no existe.
 */
export function slugDeEnlace(href?: string | null, tramos: ReadonlySet<string> = new Set()): string | null {
  if (typeof href !== 'string') return null;
  const [ruta] = partir(href);
  if (!ruta.startsWith('/') || ruta.startsWith('//')) return null;
  const partes = ruta.split('/').filter(Boolean);
  if (partes.length > 1 && tramos.has(partes[0].toLowerCase())) partes.shift();
  return partes.length > 0 ? partes.join('-').toLowerCase() : null;
}

/**
 * El tramo de URL que crea un desplegable a partir de su nombre; `null` si no sirve (sin
 * texto, o uno de los reservados de `@olo/slug-policy`, como `admin` o `login`, que son
 * carpetas de la aplicación). Sin tramo, sus hijas viven en `/{slug}` y el menú sigue
 * funcionando.
 */
export function tramoDeDesplegable(rotulo?: ReactNode): string | null {
  const nombre = texto(rotulo);
  if (!nombre) return null;
  const tramo = slugificar(nombre);
  return esSlugValido(tramo) ? tramo : null;
}

/**
 * La página a la que lleva un enlace del menú y su ruta, colgada del desplegable que lo
 * contiene (si lo hay). `tramos` son los de todos los desplegables; sin ellos, solo vale el
 * del propio desplegable.
 */
function paginaDelEnlace(
  enlace?: EnlaceDelMenu | null,
  desplegable?: EnlaceDelMenu | null,
  tramos?: ReadonlySet<string>
): { slug: string; ruta: string } | null {
  if (!enlace || typeof enlace.href !== 'string') return null;
  const tramo = desplegable ? tramoDeDesplegable(desplegable.label) : null;
  const slug = slugDeEnlace(enlace.href, tramos ?? new Set(tramo ? [tramo] : []));
  if (!slug) return null;
  return { slug, ruta: tramo ? `/${tramo}/${slug}` : `/${slug}` };
}

/**
 * El `href` que se pinta para un enlace del menú: la ruta de verdad más lo que llevara
 * detrás (`?consulta`, `#ancla`). Lo que no es un enlace interno se deja tal cual.
 */
export function hrefDelMenu(enlace?: EnlaceDelMenu | null, desplegable?: EnlaceDelMenu | null): string {
  if (!enlace || typeof enlace.href !== 'string') return enlace?.href ?? '#';
  const pagina = paginaDelEnlace(enlace, desplegable);
  if (!pagina) return enlace.href;
  return `${pagina.ruta}${partir(enlace.href)[1]}`;
}

/** El menú recorrido una vez: dónde está cada página y qué tramos crean los desplegables. */
export function mapaDelMenu(menu?: EnlaceDelMenu[] | null): MapaDelMenu {
  const mapa: MapaDelMenu = { porSlug: new Map(), porRuta: new Map(), desplegables: new Map() };
  if (!Array.isArray(menu)) return mapa;

  // Los tramos de todos los desplegables, para reconocer una ruta pegada con el suyo delante.
  const tramos = new Set<string>();
  for (const enlace of menu) {
    if (!enlace) continue;
    const tramo = (enlace.children ?? []).length > 0 ? tramoDeDesplegable(enlace.label) : null;
    if (tramo) tramos.add(tramo);
  }

  const anotar = (pagina: PaginaDelMenu) => {
    mapa.porSlug.set(pagina.slug, pagina);
    if (!mapa.porRuta.has(pagina.ruta)) mapa.porRuta.set(pagina.ruta, pagina);
  };

  const registrar = (enlace?: EnlaceDelMenu | null, desplegable?: EnlaceDelMenu | null) => {
    if (!enlace) return;
    const destino = paginaDelEnlace(enlace, desplegable, tramos);
    if (!destino || mapa.porSlug.has(destino.slug)) return;
    anotar({ ...destino, nombre: texto(enlace.label) });
  };

  /** Una interna cuelga de la página de su hija: `{ruta de la hija}/{slug}`. */
  const registrarInternas = (hija: EnlaceDelMenu, desplegable: EnlaceDelMenu) => {
    const padre = paginaDelEnlace(hija, desplegable, tramos);
    if (!padre) return;
    for (const interna of hija.internas ?? []) {
      if (!interna) continue;
      const slug = slugDeEnlace(interna.href, tramos);
      if (!slug || mapa.porSlug.has(slug)) continue;
      anotar({ slug, ruta: `${padre.ruta}/${slug}`, nombre: texto(interna.label), padre: padre.ruta });
    }
  };

  for (const enlace of menu) {
    if (!enlace) continue;
    const hijas = enlace.children ?? [];
    if (hijas.length === 0) {
      registrar(enlace);
      continue;
    }
    const tramo = tramoDeDesplegable(enlace.label);
    const nombre = texto(enlace.label);
    if (tramo && nombre) mapa.desplegables.set(`/${tramo}`, nombre);
    for (const hija of hijas) registrar(hija, enlace);
    // Después de todas las hijas: una interna no puede quitarle el slug a una página del menú.
    for (const hija of hijas) registrarInternas(hija, enlace);
  }

  return mapa;
}

/** La ruta pública de una página: la que le da el menú o, si no está en él, `/{slug}`. */
export function rutaDeSlug(slug?: string | null, mapa?: MapaDelMenu | null): string {
  if (!slug) return '/';
  return mapa?.porSlug.get(slug)?.ruta ?? `/${slug}`;
}

/**
 * El slug de la página a la que lleva un enlace escrito por una persona: el slug suelto
 * (`/resultado`) o la ruta tal como se ve en el navegador, también las de tres tramos
 * (`/clasificacion-de-las-ocupaciones/clasificacion-nacional-de-ocupaciones/resultado`). Una
 * ruta que el menú conoce manda; si no, se aplican las reglas de `slugDeEnlace`.
 */
export function slugDeEnlaceEnMenu(enlace?: string | null, mapa?: MapaDelMenu | null): string | null {
  if (typeof enlace !== 'string') return null;
  const [ruta] = partir(enlace);
  const exacta = mapa?.porRuta.get(ruta.replace(/\/+$/, '').toLowerCase());
  if (exacta) return exacta.slug;
  const tramos = new Set([...(mapa?.desplegables.keys() ?? [])].map((tramo) => tramo.slice(1)));
  return slugDeEnlace(enlace, tramos);
}

/**
 * La ruta de verdad de un enlace escrito por una persona (ver `slugDeEnlaceEnMenu`). Lo que
 * no es un enlace interno se devuelve tal cual.
 */
export function rutaDeEnlace(enlace?: string | null, mapa?: MapaDelMenu | null): string {
  if (typeof enlace !== 'string') return '';
  const slug = slugDeEnlaceEnMenu(enlace, mapa);
  return slug ? rutaDeSlug(slug, mapa) : enlace.trim();
}
