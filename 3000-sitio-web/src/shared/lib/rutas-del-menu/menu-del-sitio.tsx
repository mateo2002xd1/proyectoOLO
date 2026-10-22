'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  mapaDelMenu,
  rutaDeEnlace,
  type EnlaceDelMenu,
  type MapaDelMenu,
} from './rutas-del-menu';

interface Contexto {
  mapa: MapaDelMenu;
  /** La página de resultados del buscador de ocupaciones, escrita como un enlace del menú. */
  paginaDelBuscador: string | null;
  /** `false` si el bloque «Buscador de Ocupaciones» de la página de resultados está apagado. */
  buscadorActivo: boolean;
}

const MapaContext = createContext<Contexto | undefined>(undefined);

/**
 * Pone el menú del sitio al alcance de lo que se pinta dentro de las páginas.
 *
 * Los bloques de Puck no reciben el menú, pero necesitan saber dónde vive una página
 * (los buscadores llevan a la página de resultados). `(pages)/layout.tsx` lo monta con el
 * menú de «Menú y pie» y la página de resultados que ese mismo menú declara.
 */
export function MenuDelSitio({
  menu,
  paginaDelBuscador = null,
  buscadorActivo = true,
  children,
}: {
  menu: EnlaceDelMenu[];
  paginaDelBuscador?: string | null;
  buscadorActivo?: boolean;
  children: ReactNode;
}) {
  const valor = useMemo(
    () => ({ mapa: mapaDelMenu(menu), paginaDelBuscador, buscadorActivo }),
    [menu, paginaDelBuscador, buscadorActivo]
  );
  return <MapaContext.Provider value={valor}>{children}</MapaContext.Provider>;
}

/**
 * Convierte lo que haya escrito una persona para llegar a una página (`/clasificacion-cuoc`,
 * `/clasificacion/cuoc`) en su ruta de verdad. Fuera de `MenuDelSitio` (el editor) no hay
 * menú y devuelve `/{slug}`, que el sitio redirige a la ruta buena.
 */
export function useRutaDeEnlace() {
  const mapa = useContext(MapaContext)?.mapa;
  return (enlace: string): string => rutaDeEnlace(enlace, mapa);
}

/**
 * La ruta de la página de resultados del buscador de ocupaciones, la que se elige en
 * «Menú y pie» (campo de la cabecera), o `''` si no se eligió o no hay menú (el editor).
 * Pasa por el menú como cualquier enlace: si la página cuelga de un desplegable, la ruta lo
 * trae (`/clasificacion-de-las-ocupaciones/clasificacion-nacional-de-ocupaciones`).
 * Solo vale un enlace interno: lo que no empiece por `/` (una dirección completa, `#`) se
 * ignora, porque la búsqueda nunca debe sacar al visitante del sitio.
 */
export function useRutaDelBuscador(): string {
  const enlace = useContext(MapaContext)?.paginaDelBuscador?.trim();
  const rutaDeEnlace = useRutaDeEnlace();
  if (!enlace?.startsWith('/') || enlace.startsWith('//')) return '';
  return rutaDeEnlace(enlace);
}

/**
 * ¿Está encendido el buscador de ocupaciones? Se apaga con el campo «Buscador de ocupaciones»
 * del bloque «Buscador de Ocupaciones» (ver `features/editor/navegation/buscador-ocupaciones.ts`).
 * Fuera de `MenuDelSitio` (el editor, la vista previa) siempre está encendido.
 */
export function useBuscadorActivo(): boolean {
  return useContext(MapaContext)?.buscadorActivo ?? true;
}
