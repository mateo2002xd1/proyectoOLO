'use client';

import { useEffect, useRef, useState } from 'react';
import { IconoMascara } from './icono-mascara';

const RETRASO_MS = 350;

/**
 * Botón "ver" con ojo cerrado en reposo. Al pulsarlo el ojo se abre y, tras un
 * instante para que se vea el cambio, ejecuta la acción (abrir el detalle).
 */
export function BotonOjo({
  onClick,
  etiqueta,
  className,
}: {
  onClick: () => void;
  etiqueta: string;
  className?: string;
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
    <button type="button" onClick={pulsar} aria-label={etiqueta} title={etiqueta} className={className}>
      <IconoMascara nombre={abierto ? 'eye-open' : 'eye-closed'} tamano="h-5 w-5" />
    </button>
  );
}
