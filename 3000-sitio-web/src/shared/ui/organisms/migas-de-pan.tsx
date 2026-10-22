'use client';

import { usePathname } from 'next/navigation';
import { poppins } from '@/shared/lib/typography/fonts';
import { mapaDelMenu, type EnlaceDelMenu } from '@/shared/lib/rutas-del-menu';
import { Breadcrumb, type BreadcrumbItem } from '@/shared/ui/molecules/breadcrumb';

const INICIO: BreadcrumbItem = { label: 'Inicio', href: '/inicio' };

/** Las rutas que no llevan migas: la portada es el primer eslabón de todas. */
const SIN_MIGAS = new Set(['/', '/inicio']);

const limpiar = (ruta: string) => ruta.split(/[?#]/)[0].replace(/\/+$/, '') || '/';

/**
 * Los eslabones de una ruta pública: Inicio, el desplegable del menú que la agrupa (si lo
 * hay), la página de la que cuelga (si es una `interna`, con enlace) y la página actual.
 *
 * La ruta la arma el menú (`shared/lib/rutas-del-menu`): una hija de un desplegable es
 * `/{desplegable}/{página}`, y una página suelta, `/{página}`. Los tramos de en medio son,
 * por tanto, desplegables: aparecen con el nombre que tienen en el menú y **sin enlace**,
 * porque un desplegable no es una página (es el botón que abre el submenú). Un tramo que no
 * es un desplegable del menú no entra: ni se enlaza (llevaría a un 404) ni se rotula con un
 * nombre sacado de la URL, que un lector de pantalla leería como el de una página que no
 * existe.
 *
 * La página actual toma el nombre del menú, que manda: así un cambio en «Menú y pie» se ve
 * también aquí. Si no está en el menú, el `titulo` que tiene en la base de datos (su slug es
 * el último tramo de la ruta). Sin nombre no hay migas: la lista acabaría en otro sitio y
 * diría que el visitante está donde no está.
 */
export function eslabonesDeLaRuta(
  ruta: string,
  menu: EnlaceDelMenu[],
  titulos: Record<string, string>
): BreadcrumbItem[] {
  const actual = limpiar(ruta);
  if (SIN_MIGAS.has(actual)) return [];

  const mapa = mapaDelMenu(menu);
  const tramos = actual.split('/').filter(Boolean);
  const eslabones: BreadcrumbItem[] = [INICIO];

  tramos.slice(0, -1).forEach((_, i) => {
    const desplegable = mapa.desplegables.get(`/${tramos.slice(0, i + 1).join('/')}`);
    if (desplegable) eslabones.push({ label: desplegable });
  });

  // Una interna cuelga de una página, que sí se enlaza: a diferencia del desplegable, existe.
  const padre = mapa.porRuta.get(actual)?.padre;
  const paginaPadre = padre ? mapa.porRuta.get(padre) : undefined;
  if (paginaPadre?.nombre) eslabones.push({ label: paginaPadre.nombre, href: paginaPadre.ruta });

  const nombre = mapa.porRuta.get(actual)?.nombre ?? titulos[tramos[tramos.length - 1]]?.trim();
  if (!nombre) return [];
  eslabones.push({ label: nombre });

  return eslabones;
}

/**
 * Migas de pan de todo el sitio público, fijas debajo de la cabecera. No se editan:
 * salen de la ruta, del menú de «Menú y pie» y de los títulos de las páginas publicadas
 * (`(pages)/layout.tsx` le pasa las dos cosas). Ayudan a ubicarse a quien llega desde un
 * buscador y a quien usa un lector de pantalla (WCAG 2.4.8, nivel AAA, por encima del AA
 * exigido; las pide la guía de sitios web de GOV.CO). La lista y su accesibilidad son las
 * de `Breadcrumb`.
 */
export function MigasDePan({
  menu,
  titulos,
}: {
  menu: EnlaceDelMenu[];
  titulos: Record<string, string>;
}) {
  const eslabones = eslabonesDeLaRuta(usePathname() ?? '/', menu, titulos);
  if (eslabones.length === 0) return null;

  // Poppins por su clase de `next/font`: el `'Poppins'` de `--font-body` no es la letra que
  // carga next/font, y sin ella el 300 de la letra fina caería en la del sitio.
  return (
    <div className={`migas-de-pan ${poppins.className}`}>
      <Breadcrumb items={eslabones} className="migas-de-pan__contenido" />
    </div>
  );
}
