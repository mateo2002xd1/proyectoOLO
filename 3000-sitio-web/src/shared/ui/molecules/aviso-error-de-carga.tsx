'use client';

import { Button } from '@/shared/ui/atoms/button';

interface AvisoErrorDeCargaProps {
  /** Qué no se pudo cargar, dicho como lo lee quien usa el panel. */
  titulo: string;
  /** El porqué, ya traducido (`mensajeDeErrorApi`). */
  mensaje: string;
  onReintentar: () => void;
  /** Mientras se reintenta, el botón se desactiva y lo dice. */
  reintentando?: boolean;
}

/**
 * Lo que ve quien usa el panel cuando una sección no pudo cargar sus datos: qué pasó,
 * qué hacer y un botón para volver a intentarlo, en vez de `Error: <mensaje de axios>`.
 *
 * Ámbar y no rojo: no se perdió nada y casi siempre se arregla reintentando (en el panel
 * el rojo es para lo que no tiene vuelta atrás). `role="alert"` para que el lector de
 * pantalla lo anuncie al aparecer.
 */
export function AvisoErrorDeCarga({ titulo, mensaje, onReintentar, reintentando = false }: AvisoErrorDeCargaProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
    >
      <div className="min-w-0">
        <p className="font-semibold">{titulo}</p>
        <p className="mt-1 text-sm">{mensaje}</p>
        <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
          Espera unos segundos y pulsa «Reintentar». Si sigue igual, avisa al equipo técnico.
        </p>
      </div>
      <Button variant="navy" onClick={onReintentar} disabled={reintentando} className="shrink-0">
        {reintentando ? 'Reintentando…' : 'Reintentar'}
      </Button>
    </div>
  );
}
