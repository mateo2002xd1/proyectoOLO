'use client';

import { useSyncExternalStore } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { Button } from '@/shared/ui/atoms/button';
import { Switch } from '@/shared/ui/atoms/switch';
import {
  cambiarSonidoAvisos,
  sonidoAvisosActivo,
  suscribirSonidoAvisos,
  tocarSonidoAviso,
  type TipoConSonido,
} from '@/shared/lib/sonido-avisos';

const MUESTRAS: { tipo: TipoConSonido; etiqueta: string }[] = [
  { tipo: 'success', etiqueta: 'Éxito' },
  { tipo: 'warning', etiqueta: 'Advertencia' },
  { tipo: 'error', etiqueta: 'Error' },
];

/**
 * Activa o silencia el tono de los avisos flotantes (`Notification`) en este navegador.
 * Las muestras suenan aunque esté silenciado: las pide la persona con un clic.
 */
export function PreferenciaSonidoAvisos() {
  // En el servidor no hay `localStorage`: se pinta activo, que es el valor por defecto.
  const activo = useSyncExternalStore(suscribirSonidoAvisos, sonidoAvisosActivo, () => true);

  return (
    <section
      aria-labelledby="titulo-sonido-avisos"
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <SpeakerWaveIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gray-500 dark:text-[#94a3b8]" />
          <div className="min-w-0">
            <h2 id="titulo-sonido-avisos" className="font-semibold text-[#001631] dark:text-[#f6f6f6]">
              Sonido de los avisos
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#94a3b8]">
              Un tono corto acompaña a los avisos de éxito, advertencia y error. Se guarda en
              este navegador.
            </p>
          </div>
        </div>
        <Switch checked={activo} onChange={cambiarSonidoAvisos} aria-label="Sonido de los avisos" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 sm:pl-8">
        <span className="w-full text-sm text-gray-500 sm:w-auto dark:text-[#94a3b8]">Escuchar:</span>
        {MUESTRAS.map(({ tipo, etiqueta }) => (
          <Button key={tipo} type="button" plain onClick={() => void tocarSonidoAviso(tipo)}>
            {etiqueta}
          </Button>
        ))}
      </div>
    </section>
  );
}
