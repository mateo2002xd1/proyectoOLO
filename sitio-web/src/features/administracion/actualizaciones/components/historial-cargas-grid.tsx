'use client';

import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/shared/ui/molecules/alert';
import { Button } from '@/shared/ui/atoms/button';
import type { CargaDatos } from '../types';

interface HistorialCargasGridProps {
  cargas: CargaDatos[];
  /** Ausente en solo-lectura (quien no `puedeActualizar` no ve la columna de borrar). */
  onEliminar?: (id: string) => void;
}

const ETIQUETA_ESTADO: Record<CargaDatos['estado'], string> = {
  procesando: 'Procesando',
  completado: 'Completado',
  error: 'Error',
};

/** Mismo criterio que `COLOR_ACCION` en auditoría: la píldora nunca depende solo
 *  del color, siempre lleva su etiqueta al lado (`9-accesibilidad.md`). */
const COLOR_ESTADO: Record<CargaDatos['estado'], string> = {
  completado: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  procesando: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

const etiquetaEstado = (carga: CargaDatos) =>
  carga.estado === 'procesando' ? `${ETIQUETA_ESTADO.procesando} · ${carga.progreso}%` : ETIQUETA_ESTADO[carga.estado];

const formatearFecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

/**
 * Historial de cargas: tabla nativa con los mismos colores y densidad que el
 * resto del panel (auditoría, actividad reciente). Reemplaza una primera
 * versión con `handsontable` — una grilla de hoja de cálculo completa era
 * mucho para 4 columnas de solo lectura, no tenía modo oscuro y su scroll
 * interno recortaba la columna de borrar en tarjetas angostas.
 */
export function HistorialCargasGrid({ cargas, onEliminar }: HistorialCargasGridProps) {
  const [cargaAEliminar, setCargaAEliminar] = useState<CargaDatos | null>(null);

  const confirmarEliminar = () => {
    if (cargaAEliminar) onEliminar?.(cargaAEliminar.id);
    setCargaAEliminar(null);
  };

  if (cargas.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-[#94a3b8]">
        Todavía no se ha hecho ninguna carga.
      </p>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Fecha</th>
              <th scope="col" className="px-3 py-2 font-medium">Estado</th>
              <th scope="col" className="px-3 py-2 font-medium">Filas</th>
              <th scope="col" className="px-3 py-2 font-medium">Mensaje</th>
              {onEliminar && (
                <th scope="col" className="px-3 py-2 font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {cargas.map((carga) => (
              <tr key={carga.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                  {formatearFecha(carga.creadoEn)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${COLOR_ESTADO[carga.estado]}`}
                  >
                    {carga.estado === 'procesando' && (
                      <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-current" />
                    )}
                    {etiquetaEstado(carga)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {carga.estado === 'error' ? '—' : carga.filasProcesadas.toLocaleString('es-CO')}
                </td>
                <td className="px-3 py-3 text-zinc-500 dark:text-[#94a3b8]">
                  {carga.mensaje ?? '—'}
                </td>
                {onEliminar && (
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setCargaAEliminar(carga)}
                      className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      aria-label={`Eliminar la carga del ${formatearFecha(carga.creadoEn)}`}
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Alert open={cargaAEliminar !== null} onClose={(open) => !open && setCargaAEliminar(null)}>
        <AlertTitle>¿Eliminar esta carga?</AlertTitle>
        <AlertDescription>
          Se borra del historial y, si ningún otro registro usa el mismo archivo, también el Excel
          guardado en el servidor. Los datos que ya quedaron en el mapa de formación no se tocan —
          esto solo borra la auditoría de la carga.
          {cargaAEliminar?.estado === 'procesando' && (
            <>
              {' '}
              Esta carga todavía figura como «procesando»: si de verdad se sigue ejecutando, borrarla
              no la detiene, solo hace que deje de verse aquí.
            </>
          )}
        </AlertDescription>
        <AlertActions>
          <Button type="button" plain onClick={() => setCargaAEliminar(null)}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" onClick={confirmarEliminar}>
            Eliminar
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}
