'use client';

import { useEffect } from 'react';
import { desplazarAElemento } from './busqueda-scroll';

export interface ResaltadorDeBusquedaProps {
  /**
   * Opcional: pasa el pathname de la aplicación para re-evaluar al cambiar de página.
   */
  pathname?: string;
  delayMs?: number;
}

/**
 * Componente detector para desplazar y resaltar automáticamente
 * el elemento buscado cuando una página carga con ?resaltar=... o #blockId.
 */
export function ResaltadorDeBusqueda({ pathname, delayMs = 120 }: ResaltadorDeBusquedaProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const texto = params.get('resaltar');
    const hash = window.location.hash ? window.location.hash.slice(1) : undefined;

    if (!texto && !hash) return;

    let cancelado = false;

    const ejecutar = () => {
      if (cancelado) return;
      const exito = desplazarAElemento({
        blockId: hash || undefined,
        texto: texto || undefined,
      });

      if (exito && texto) {
        const url = new URL(window.location.href);
        url.searchParams.delete('resaltar');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
      return exito;
    };

    const t1 = setTimeout(ejecutar, delayMs);
    const t2 = setTimeout(ejecutar, delayMs + 260);
    const t3 = setTimeout(ejecutar, delayMs + 650);

    return () => {
      cancelado = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, delayMs]);

  return null;
}
