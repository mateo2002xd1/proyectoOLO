/**
 * Valores por defecto de la cabecera del sitio.
 *
 * Son la base sobre la que `obtenerPlantilla` aplica lo que se haya guardado en el
 * bloque `Header` de «Menú y pie», y los `defaultProps` de ese bloque en el editor:
 * arrastrarlo al lienzo da la cabecera que ya se ve hoy, no una vacía.
 *
 * Hasta el 2026-09-18 vivían en `features/identidad-visual/`, con un servicio que los
 * pedía a `GET /api/identidad-visual`. Esa ruta nunca existió en la API: la petición
 * respondía 404 cada vez que el servidor armaba una página y siempre se terminaba
 * usando este valor. Ahora es una constante y no se pide nada.
 *
 * El mismo menú está repetido como respaldo dentro de `shared/lib/blocks/header.tsx` y
 * en `4000-api-backend/scripts/semillas/sembrar-plantilla-sitio.ts`. Al cambiar uno, revisar los otros.
 */

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
  /** Submenú desplegable. Si trae elementos, el enlace se pinta como un dropdown. */
  children?: NavLink[];
  colorTexto?: string;
  colorHover?: string;
  tamanoTexto?: string;
  colorFondoSubmenu?: string;
}

export interface CabeceraPorDefecto {
  govBannerEnabled: boolean;
  govBannerImageUrl?: string;
  mainLogoUrl?: string;
  intranetText: string;
  navLinks: NavLink[];
  /** Fondo de la barra del menú. Vacío = el blanco del CSS. */
  colorFondo?: string;
  /** Fondo de la franja GOV.CO. Vacío = blanca (ver `tinta-de-franja.ts`). */
  colorFranjaGov?: string;
  govBannerEnlace?: string;
  govBannerMargenArriba?: number | '';
  govBannerMargenAbajo?: number | '';
  alineacionFranjaGov?: string;
  separacionFranjaGov?: string;
  separacionLogoMenu?: number | '';
  separacionMenuAcciones?: number | '';
  /** Texto y colores del botón «Intranet». Ver `BotonIntranet` en header.tsx. */
  botonIntranet?: { texto?: string; colorFondo?: string; colorTexto?: string };
}

// Sin `intranetUrl`: la cabecera la toma siempre de NEXT_PUBLIC_INTRANET_URL (ver header.tsx).
export const CABECERA_POR_DEFECTO: CabeceraPorDefecto = {
  govBannerEnabled: true,
  intranetText: 'Intranet',
  navLinks: [
    { label: 'Inicio', href: '/inicio', active: true },
    {
      label: 'Clasificaciones',
      href: '/clasificacion',
      children: [
        { label: 'Clasificación Única de Ocupaciones para Colombia', href: '/clasificacion/cuoc' },
        { label: 'Clasificación Nacional de Ocupaciones', href: '/clasificacion/cno' },
      ],
    },
    { label: 'Tendencias de las Ocupaciones', href: '/tendencias' },
    { label: 'Publicaciones', href: '/publicaciones' },
    { label: 'APE', href: '/ape' },
  ],
};
