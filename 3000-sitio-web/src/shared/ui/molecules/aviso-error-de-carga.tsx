'use client';

import { Button } from '@/shared/ui/atoms/button';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';

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
 * el rojo es para lo que no tiene vuelta atrás): es el mensaje de estado de advertencia
 * (`MensajeEstado`). `role="alert"` para que el lector de pantalla lo anuncie al aparecer.
 */
export function AvisoErrorDeCarga({ titulo, mensaje, onReintentar, reintentando = false }: AvisoErrorDeCargaProps) {
  return (
    <MensajeEstado tipo="advertencia" rol="alert">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold">{titulo}</p>
          <p className="mt-1">{mensaje}</p>
          <p className="mt-1">
            Espera unos segundos y pulsa «Reintentar». Si sigue igual, avisa al equipo técnico.
          </p>
        </div>
        <Button variant="navy" onClick={onReintentar} disabled={reintentando} className="shrink-0">
          {reintentando ? 'Reintentando…' : 'Reintentar'}
        </Button>
      </div>
    </MensajeEstado>
  );
}
