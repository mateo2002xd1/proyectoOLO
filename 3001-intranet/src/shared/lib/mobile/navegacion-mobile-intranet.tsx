'use client';

import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { IconoRenderer } from '@olo/blocks-renderer';
import type { ItemMenuIntranet } from '@/shared/lib/blocks/plantilla/intranet-topbar';
import { NavegacionMobile, type DestinoMobile } from './navegacion-mobile';

/** Carpeta de los iconos del móvil. Cambiar un archivo cambia el icono, sin tocar código. */
const CARPETA_ICONOS = '/assets/svg/mobile';

/**
 * Icono de cada sección cuando el menú no trae uno elegido en el editor. Se busca
 * por el primer tramo de la ruta, así «/encuestas/calidad-de-formacion» cae en
 * `encuestas`. Lo que no esté aquí lleva `seccion.svg`.
 */
const ICONO_POR_SECCION: Record<string, string> = {
  tasa: `${CARPETA_ICONOS}/tasa.svg`,
  matriz: `${CARPETA_ICONOS}/matriz.svg`,
  encuestas: `${CARPETA_ICONOS}/encuestas.svg`,
};

/** Más de tres secciones a los lados del logo no caben a 320 px con su etiqueta. */
const MAXIMO_A_LA_VISTA = 3;

const esInicio = (href?: string) => href === '/inicio' || href === '/';

/** La ruta que representa al elemento: la suya o, si solo despliega (`#`), la de su primer hijo. */
function rutaDe(item: ItemMenuIntranet): string {
  if (item.href && item.href !== '#') return item.href;
  return item.children?.find((hijo) => hijo.href && hijo.href !== '#')?.href ?? '';
}

function seccionDe(item: ItemMenuIntranet): string {
  return rutaDe(item).split(/[?#]/)[0].split('/').filter(Boolean)[0] ?? '';
}

/**
 * Texto corto bajo el icono. Primero el que se escribió para el móvil en el editor;
 * si no hay, el del menú cuando es corto, o su primera palabra («Tasa de Vinculación y
 * Empleabilidad» → «Tasa»). En el editor el texto del menú llega como elemento de
 * Puck (se edita en línea) y no se puede recortar: se usa el nombre de la sección.
 */
function etiquetaCorta(item: ItemMenuIntranet): string {
  const propia = item.etiquetaMovil?.trim();
  if (propia) return propia;
  if (typeof item.label === 'string' && item.label.trim()) {
    const texto = item.label.trim();
    return texto.length <= 12 ? texto : texto.split(/\s+/)[0];
  }
  const seccion = seccionDe(item);
  return seccion ? seccion.charAt(0).toUpperCase() + seccion.slice(1).replace(/-/g, ' ') : 'Sección';
}

function icono(item: ItemMenuIntranet) {
  const ruta = item.icono || ICONO_POR_SECCION[seccionDe(item)] || `${CARPETA_ICONOS}/seccion.svg`;
  return <IconoRenderer icono={ruta} size={24} />;
}

interface NavegacionMobileIntranetProps {
  menuItems: ItemMenuIntranet[];
  /** El fondo elegido en Puck para la barra de arriba; vacío deja el azul de siempre. */
  fondo?: string;
  /** Abre el buscador de la barra de arriba, que en el móvil no tiene botón propio. */
  onBuscar?: () => void;
}

/**
 * Navegación mobile de la intranet: el mismo menú que la barra de arriba (el de la
 * plantilla, editable en Puck), con el logo de OLO en el centro como «Inicio» y
 * «Buscar» al final. Si el menú crece, lo que no cabe va a «Más». «Cerrar sesión»
 * no va aquí: en el móvil está arriba a la derecha (`intranet-topbar.tsx`).
 */
export function NavegacionMobileIntranet({ menuItems, fondo, onBuscar }: NavegacionMobileIntranetProps) {
  const pathname = usePathname() ?? '';

  const estaEn = (href?: string) =>
    Boolean(href) && href !== '#' && (pathname === href || pathname.startsWith(`${href}/`));

  const aDestino = (item: ItemMenuIntranet, indice: number): DestinoMobile => {
    const hijos = (item.children ?? []).filter((hijo) => hijo.href);
    const destino: DestinoMobile = {
      clave: `menu-${indice}`,
      etiqueta: etiquetaCorta(item),
      icono: icono(item),
      activo: estaEn(item.href) || hijos.some((hijo) => estaEn(hijo.href)),
    };
    if (hijos.length > 0) {
      destino.hijos = hijos.map((hijo, i) => ({
        clave: `menu-${indice}-${i}`,
        etiqueta: typeof hijo.label === 'string' && hijo.label.trim() ? hijo.label : hijo.href ?? '',
        href: hijo.href,
        activo: estaEn(hijo.href),
      }));
      // Con destino propio además de submenú, la hoja lo ofrece como primera fila.
      if (item.href && item.href !== '#') {
        destino.hijos.unshift({
          clave: `menu-${indice}-propio`,
          etiqueta: etiquetaCorta(item),
          href: item.href,
          activo: pathname === item.href,
        });
      }
    } else {
      destino.href = item.href;
    }
    return destino;
  };

  const itemInicio = menuItems.find((item) => esInicio(item.href));
  const secciones = menuItems
    .filter((item) => !esInicio(item.href) && (rutaDe(item) || item.children?.length))
    .map(aDestino);

  const buscar: DestinoMobile = {
    clave: 'buscar',
    etiqueta: 'Buscar',
    icono: <IconoRenderer icono={`${CARPETA_ICONOS}/buscar.svg`} size={24} />,
    alPulsar: onBuscar,
  };

  let destinos: DestinoMobile[];
  if (secciones.length <= MAXIMO_A_LA_VISTA) {
    destinos = [...secciones, buscar];
  } else {
    const resto = secciones.slice(MAXIMO_A_LA_VISTA);
    destinos = [
      ...secciones.slice(0, MAXIMO_A_LA_VISTA),
      {
        clave: 'mas',
        etiqueta: 'Más',
        icono: <IconoRenderer icono={`${CARPETA_ICONOS}/mas.svg`} size={24} />,
        activo: resto.some((destino) => destino.activo),
        // Una sección con submenú dentro de «Más» se abre a sus hijos: una hoja no
        // abre otra hoja.
        hijos: [
          ...resto.flatMap((destino) =>
            destino.hijos ? destino.hijos : [{ ...destino }],
          ),
          buscar,
        ],
      },
    ];
  }

  return (
    <NavegacionMobile
      etiqueta="Secciones de la intranet"
      destinos={destinos}
      inicio={{
        href: itemInicio?.href === '/' ? '/inicio' : itemInicio?.href ?? '/inicio',
        etiqueta: itemInicio ? etiquetaCorta(itemInicio) : 'Inicio',
        logo: '/assets/svg/olo-logo-none.svg',
        activo: pathname === '/inicio' || pathname === '/',
      }}
      style={fondo ? ({ '--navegacion-mobile-fondo': fondo } as CSSProperties) : undefined}
    />
  );
}
