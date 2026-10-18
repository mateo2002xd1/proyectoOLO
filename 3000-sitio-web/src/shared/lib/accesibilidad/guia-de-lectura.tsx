'use client';

import { useEffect, useRef } from 'react';

/**
 * Guía de lectura: oscurece la página por encima y por debajo de una franja que sigue al
 * puntero (o al dedo), para no perder el renglón. Ayuda con la dislexia, el TDAH y la baja
 * visión.
 *
 * La franja se mueve cambiando una variable CSS en el propio elemento, sin pasar por el
 * estado de React: un `pointermove` llega decenas de veces por segundo y volver a pintar
 * el componente en cada uno haría que se arrastrara.
 */
export function GuiaDeLectura() {
  const guia = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mover = (evento: PointerEvent) => {
      guia.current?.style.setProperty('--olo-guia-y', `${evento.clientY}px`);
    };
    window.addEventListener('pointermove', mover, { passive: true });
    return () => window.removeEventListener('pointermove', mover);
  }, []);

  return (
    <div ref={guia} className="olo-a11y-guia" aria-hidden="true">
      <div className="olo-a11y-guia__arriba" />
      <div className="olo-a11y-guia__abajo" />
    </div>
  );
}
