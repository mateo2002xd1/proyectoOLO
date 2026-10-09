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
 *
 * Estrategia de búsqueda:
 * 1. Tres intentos rápidos (150 ms, 410 ms, 800 ms) para el caso habitual.
 * 2. Si ninguno tiene éxito, activa un MutationObserver que escucha nuevos
 *    nodos en el DOM: ideal para contenedores con carga asíncrona (tablas con
 *    API, mapas, listas paginadas, etc.) que no están en el DOM al cargar.
 * 3. El observer se desconecta solo cuando encuentra el elemento o tras 6 s
 *    como tope de seguridad para evitar fugas de memoria.
 */
export function ResaltadorDeBusqueda({ pathname, delayMs = 120 }: ResaltadorDeBusquedaProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const texto = params.get('resaltar');
    const hash = window.location.hash ? window.location.hash.slice(1) : undefined;

    if (!texto && !hash) return;

    let cancelado = false;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    let tObserver: ReturnType<typeof setTimeout>;
    let observer: MutationObserver | null = null;

    /** Limpia todos los recursos activos */
    const limpiar = () => {
      cancelado = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tObserver);
      observer?.disconnect();
      observer = null;
    };

    /** Borra el param ?resaltar de la URL sin recargar */
    const limpiarUrl = () => {
      if (!texto) return;
      const url = new URL(window.location.href);
      url.searchParams.delete('resaltar');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    };

    const ejecutar = (): boolean => {
      if (cancelado) return false;
      const exito = desplazarAElemento({
        blockId: hash || undefined,
        texto: texto || undefined,
      });

      if (exito) {
        limpiar();
        limpiarUrl();
      }
      return exito;
    };

    /**
     * Activa un MutationObserver sobre el body que reintenta cada vez que
     * se añaden nuevos nodos al DOM. Útil para contenedores que cargan datos
     * de forma asíncrona (tablas con fetch, mapas, acordeones, etc.).
     * Se desconecta automáticamente al encontrar el elemento o tras maxMs.
     */
    const activarObserver = (maxMs = 6000) => {
      if (cancelado || observer) return;

      // Cooldown mínimo entre reintentos para no saturar con mutaciones masivas
      let enCooldown = false;

      observer = new MutationObserver(() => {
        if (cancelado || enCooldown) return;
        enCooldown = true;
        // Pequeño delay para agrupar ráfagas de mutaciones (ej. inserción de filas de tabla)
        setTimeout(() => {
          enCooldown = false;
          if (!cancelado) ejecutar();
        }, 80);
      });

      observer.observe(document.body, {
        childList: true,   // detecta nodos añadidos/eliminados
        subtree: true,     // en cualquier nivel del árbol
      });

      // Tope de seguridad: desconectar el observer aunque no haya tenido éxito
      tObserver = setTimeout(() => {
        observer?.disconnect();
        observer = null;
      }, maxMs);
    };

    // Fase 1: intentos rápidos (cubre la mayoría de páginas con SSR/SSG)
    t1 = setTimeout(() => { if (!ejecutar()) { /* sigue con t2 */ } }, delayMs);
    t2 = setTimeout(() => { if (!ejecutar()) { /* sigue con t3 */ } }, delayMs + 260);
    t3 = setTimeout(() => {
      if (!ejecutar()) {
        // Fase 2: los 3 intentos rápidos fallaron → el contenido todavía no está
        // en el DOM (carga asíncrona). Activar el observer.
        activarObserver(6000);
      }
    }, delayMs + 650);

    return limpiar;
  }, [pathname, delayMs]);

  return null;
}
