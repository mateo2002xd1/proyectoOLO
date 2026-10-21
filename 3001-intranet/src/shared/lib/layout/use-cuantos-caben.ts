'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Cuántas piezas de al menos `anchoMinimo` px caben en el ancho de un elemento, con
 * `hueco` px entre ellas, sin pasar de `maximo` ni bajar de 1.
 *
 * Mide el contenedor y no la ventana (`2-convenciones-del-proyecto.md` §10.3): el
 * mismo carrusel va a lo ancho en una sección y en media columna en otra. Lo usan
 * los carruseles de la intranet, que antes mostraban siempre las N imágenes que se
 * configuraron en el editor: en un móvil eran dos imágenes de 80px entre flechas.
 *
 * Hasta que el navegador mide devuelve `maximo`, que es lo que pinta el servidor:
 * así la hidratación no discrepa. Se mide el `contentRect` (sin el relleno).
 */
export function useCuantosCaben<T extends HTMLElement>(maximo: number, anchoMinimo: number, hueco = 0) {
  const ref = useRef<T>(null);
  const [ancho, setAncho] = useState<number | null>(null);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento || typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(([entrada]) => setAncho(entrada.contentRect.width));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  const caben = ancho === null ? maximo : Math.floor((ancho + hueco) / (anchoMinimo + hueco));
  return { ref, cuantos: Math.max(1, Math.min(maximo, caben)) };
}
