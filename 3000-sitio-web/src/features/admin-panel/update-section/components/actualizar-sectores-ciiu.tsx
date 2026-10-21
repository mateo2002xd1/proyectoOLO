'use client';

import { useRef, useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/20/solid';
import { mensajeDeErrorApi } from '@/shared/lib/api/errores-api';
import { actualizarSectoresCiiu } from '../services/observatorio.service';
import type { ResultadoActualizarSectores } from '../types';

/**
 * Botón «Actualizar sectores (CIIU)» de la tarjeta de Alertas de inversión: sube un
 * Excel de dos columnas (código y nombre) y muestra el resumen de lo que hizo. Es
 * síncrono —son cientos de filas—, así que no hay barra de progreso ni historial.
 */
export function ActualizarSectoresCiiu() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoActualizarSectores | null>(null);

  const alElegirArchivo = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    setResultado(null);
    try {
      setResultado(await actualizarSectoresCiiu(archivo));
    } catch (err) {
      setError(mensajeDeErrorApi(err, 'No se pudieron actualizar los sectores.'));
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <label
        className={`inline-flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors dark:border-zinc-600 dark:text-zinc-200 ${
          subiendo ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-brand-interactive'
        }`}
      >
        <ArrowUpTrayIcon className="size-4 text-brand-interactive" />
        {subiendo ? 'Actualizando...' : 'Actualizar sectores (CIIU)'}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={alElegirArchivo}
          disabled={subiendo}
          className="hidden"
        />
      </label>

      {error && <p className="basis-full text-sm text-red-600 dark:text-red-400">{error}</p>}

      {resultado && (
        <div
          className="basis-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-200"
          aria-live="polite"
        >
          <p className="font-medium">
            Sectores actualizados: {resultado.creados} nuevos, {resultado.actualizados} con nombre cambiado,{' '}
            {resultado.sinCambios} sin cambios.
          </p>
          {resultado.omitidos > 0 && (
            <p className="mt-1 text-zinc-500 dark:text-[#94a3b8]">
              {resultado.omitidos} código(s) de 2 o 3 dígitos se omitieron: solo se guardan los de 4 dígitos. Si
              un código de 4 dígitos empieza en cero (0111), guárdelo en Excel como texto para no perder el cero.
            </p>
          )}
          {resultado.errores.length > 0 && (
            <>
              <p className="mt-2 font-medium text-red-700 dark:text-red-400">
                {resultado.errores.length} fila(s) no se procesaron:
              </p>
              <ul className="mt-1 max-h-32 list-disc space-y-0.5 overflow-y-auto pl-5 text-red-700 dark:text-red-400">
                {resultado.errores.map((e) => (
                  <li key={e.fila}>
                    Fila {e.fila}: {e.mensaje}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </>
  );
}
