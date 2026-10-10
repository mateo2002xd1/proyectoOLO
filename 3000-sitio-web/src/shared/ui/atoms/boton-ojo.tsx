'use client';

import { useEffect, useRef, useState } from 'react';
import { IconoMascara } from './icono-mascara';
import { GRUPO_TOOLTIP, TOOLTIP_ENCIMA_A_LA_DERECHA } from './tooltip';

const RETRASO_MS = 350;

/**
 * Botón "ver" con ojo cerrado en reposo. Al pulsarlo el ojo se abre y, tras un
 * instante para que se vea el cambio, ejecuta la acción (abrir el detalle).
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
      className={claseTooltip ? `${GRUPO_TOOLTIP} ${className ?? ''}` : className}
    >
      <IconoMascara nombre={abierto ? 'eye-open' : 'eye-closed'} tamano="h-5 w-5" />
      {claseTooltip && (
        <span aria-hidden="true" className={`${TOOLTIP_ENCIMA_A_LA_DERECHA} ${claseTooltip}`}>
          {etiqueta}
        </span>
      )}
    </button>
  );
}
