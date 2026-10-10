'use client';

import { useEffect, useRef, useState } from 'react';
import { IconoMascara } from './icono-mascara';
import { GRUPO_TOOLTIP, TOOLTIP_ENCIMA_A_LA_DERECHA } from './tooltip';

const RETRASO_MS = 350;

/**
 * Botón "ver" con ojo cerrado en reposo. Se abre al pasar el puntero o al llegar con el
 * teclado (como el ojo de la cola de revisión), y al pulsarlo se queda abierto un instante
 * antes de ejecutar la acción (abrir el detalle), para que se vea el cambio.
 *
 * Con `claseTooltip` (su fondo y su letra) muestra la etiqueta en un tooltip propio
 * (`./tooltip.ts`) en vez del `title` del navegador; sin ella sigue con el `title`.
 * Va alineado a la derecha porque este botón vive al final de la fila.
 */
export function BotonOjo({
  onClick,
  etiqueta,
  className,
  claseTooltip,
}: {
  onClick: () => void;
  etiqueta: string;
  className?: string;
  claseTooltip?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  function pulsar() {
    if (temporizador.current) return;
    setAbierto(true);
    temporizador.current = setTimeout(() => {
      temporizador.current = null;
      setAbierto(false);
      onClick();
    }, RETRASO_MS);
  }

  return (
    <button
      type="button"
      onClick={pulsar}
      aria-label={etiqueta}
      title={claseTooltip ? undefined : etiqueta}
      className={`group/ojo ${claseTooltip ? GRUPO_TOOLTIP : ''} ${className ?? ''}`}
    >
      {/* Los dos ojos montados y uno oculto: cambiar el `nombre` de la máscara al pasar el
          puntero haría pedir el SVG del abierto la primera vez y se vería un parpadeo. */}
      <span className="relative block h-5 w-5">
        <span
          className={`absolute inset-0 ${abierto ? 'hidden' : 'flex group-hover/ojo:hidden group-focus-visible/ojo:hidden'}`}
        >
          <IconoMascara nombre="eye-closed" tamano="h-5 w-5" />
        </span>
        <span
          className={`absolute inset-0 ${abierto ? 'flex' : 'hidden group-hover/ojo:flex group-focus-visible/ojo:flex'}`}
        >
          <IconoMascara nombre="eye-open" tamano="h-5 w-5" />
        </span>
      </span>
      {claseTooltip && (
        <span aria-hidden="true" className={`${TOOLTIP_ENCIMA_A_LA_DERECHA} ${claseTooltip}`}>
          {etiqueta}
        </span>
      )}
    </button>
  );
}
