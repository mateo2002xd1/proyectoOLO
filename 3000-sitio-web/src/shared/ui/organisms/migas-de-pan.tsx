'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { poppins } from '@/shared/lib/typography/fonts';
import { Breadcrumb, type BreadcrumbItem } from '@/shared/ui/molecules/breadcrumb';

/** Lo que se necesita de un enlace del menú de la cabecera (`NavItem` en header.tsx). */
export interface EnlaceDelMenu {
  label: ReactNode;
  href: string;
  children?: EnlaceDelMenu[];
}

const INICIO: BreadcrumbItem = { label: 'Inicio', href: '/inicio' };

/**
 * Nombres de las páginas con carpeta propia en `app/(pages)/` que el menú no tiene por
 * qué enlazar. Lo que sí está en el menú toma el nombre del menú, que manda: así un
 * cambio de nombre en «Menú y pie» se ve también aquí.
 */
const NOMBRES_FIJOS: Record<string, string> = {
  '/clasificacion': 'Clasificaciones',
  '/clasificacion/cno': 'Clasificación Nacional de Ocupaciones',
  '/clasificacion/cuoc': 'Clasificación Única de Ocupaciones para Colombia',
  '/alertas-inversion': 'Alertas de inversión',
  '/politica-de-privacidad': 'Política de seguridad y privacidad de la información',
  '/programas-sobresalientes': 'Programas sobresalientes',
};

/** Las rutas que no llevan migas: la portada es el primer eslabón de todas. */
const SIN_MIGAS = new Set(['/', '/inicio']);

const limpiar = (ruta: string) => ruta.split(/[?#]/)[0].replace(/\/+$/, '') || '/';

/** `mercado-laboral` → «Mercado laboral», para una página que no está en ningún sitio. */
const humanizar = (segmento: string) => {
  const texto = decodeURIComponent(segmento).replace(/[-_]+/g, ' ').trim();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

/** Solo valen los rótulos de texto; un rótulo con marcado no se puede repetir aquí. */
const texto = (rotulo: ReactNode) => (typeof rotulo === 'string' && rotulo.trim() ? rotulo.trim() : null);

interface EnMenu {
  nombre: string;
  /** La sección del menú que lo agrupa, si es un enlace de un submenú. */
  grupo?: EnlaceDelMenu;
}

function indiceDelMenu(menu: EnlaceDelMenu[]) {
  const indice = new Map<string, EnMenu>();
  for (const enlace of menu) {
    const nombre = texto(enlace.label);
    if (nombre && enlace.href) indice.set(limpiar(enlace.href), { nombre });
    for (const hijo of enlace.children ?? []) {
      const nombreHijo = texto(hijo.label);
      if (nombreHijo && hijo.href && !indice.has(limpiar(hijo.href))) {
        indice.set(limpiar(hijo.href), { nombre: nombreHijo, grupo: enlace });
      }
    }
  }
  return indice;
}

/** El enlace de una sección del menú, si lleva a una página y no es un «#» de desplegable. */
const rutaDeSeccion = (enlace: EnlaceDelMenu) => {
  const ruta = enlace.href ? limpiar(enlace.href) : '';
  return ruta.startsWith('/') && ruta !== '/' ? ruta : undefined;
};

/**
 * Los eslabones de una ruta pública: Inicio, cada tramo de la ruta y la página actual.
 *
 * Cada tramo toma el nombre del menú; si no está, el de `NOMBRES_FIJOS`; y si tampoco,
 * el propio tramo legible (una sección nueva que nadie ha puesto en el menú). Un tramo
 * intermedio solo es enlace si se sabe que existe (está en el menú o en la tabla): si no,
 * `/encuestas` en `/encuestas/tasa` llevaría a un 404. Si la página es un enlace de un
 * submenú cuya sección no forma parte de la ruta (el submenú «Servicios» con `/ape`), la
 * sección entra como eslabón intermedio, que es por donde el visitante llegó.
 */
export function eslabonesDeLaRuta(ruta: string, menu: EnlaceDelMenu[]): BreadcrumbItem[] {
  const actual = limpiar(ruta);
  if (SIN_MIGAS.has(actual)) return [];

  const indice = indiceDelMenu(menu);
  const segmentos = actual.split('/').filter(Boolean);
  const eslabones: BreadcrumbItem[] = [INICIO];

  segmentos.forEach((segmento, i) => {
    const tramo = `/${segmentos.slice(0, i + 1).join('/')}`;
    const delMenu = indice.get(tramo);
    const esLaActual = i === segmentos.length - 1;

    if (esLaActual && delMenu?.grupo) {
      const grupo = delMenu.grupo;
      const rutaGrupo = rutaDeSeccion(grupo);
      const yaEsta = rutaGrupo && eslabones.some((eslabon) => eslabon.href === rutaGrupo);
      const nombreGrupo = texto(grupo.label);
      if (!yaEsta && nombreGrupo) eslabones.push({ label: nombreGrupo, href: rutaGrupo });
    }

    const nombre = delMenu?.nombre ?? NOMBRES_FIJOS[tramo] ?? humanizar(segmento);
    const existe = Boolean(delMenu || NOMBRES_FIJOS[tramo]);
    eslabones.push({ label: nombre, href: esLaActual || !existe ? undefined : tramo });
  });

  return eslabones;
}

/**
 * Migas de pan de todo el sitio público, fijas debajo de la cabecera. No se editan:
 * salen de la ruta y del menú de «Menú y pie» (`(pages)/layout.tsx` le pasa el menú).
 * Ayudan a ubicarse a quien llega desde un buscador y a quien usa un lector de pantalla
 * (WCAG 2.4.8, nivel AAA, por encima del AA exigido; las pide la guía de sitios web de
 * GOV.CO). La lista y su accesibilidad son las de `Breadcrumb`.
 */
export function MigasDePan({ menu }: { menu: EnlaceDelMenu[] }) {
  const eslabones = eslabonesDeLaRuta(usePathname() ?? '/', menu);
  if (eslabones.length === 0) return null;

  // Poppins por su clase de `next/font`: el `'Poppins'` de `--font-body` no es la letra que
  // carga next/font, y sin ella el 300 de la letra fina caería en la del sistema.
  return (
    <div className={`migas-de-pan ${poppins.className}`}>
      <Breadcrumb items={eslabones} className="migas-de-pan__contenido" />
    </div>
  );
}
