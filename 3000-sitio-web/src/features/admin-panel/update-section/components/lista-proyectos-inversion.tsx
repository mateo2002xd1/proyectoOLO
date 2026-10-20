'use client';

import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/shared/ui/molecules/alert';
import { Button } from '@/shared/ui/atoms/button';
import type { ProyectoInversionPanel } from '../types';

interface ListaProyectosInversionProps {
  proyectos: ProyectoInversionPanel[];
  /** Ausente en solo-lectura: quien no `puedeActualizar` no ve el icono de borrar. */
  onEliminar?: (id: string) => void;
  /** Borra todos; ausente en solo-lectura. */
  onLimpiar?: () => void;
}

const ETIQUETA_TIPO: Record<ProyectoInversionPanel['tipo'], string> = {
  nuevo: 'Nuevo',
  expansion: 'Expansión',
};

const formatearFecha = (fecha: string) =>
  new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CO', { dateStyle: 'medium' });

/**
 * Proyectos de inversión ya publicados — tanto los de alta manual como los de Excel,
 * que son indistinguibles en `proyectos_inversion`. Es la única forma de quitar uno:
 * borrar una carga del historial no toca los proyectos que dejó.
 */
export function ListaProyectosInversion({ proyectos, onEliminar, onLimpiar }: ListaProyectosInversionProps) {
  const [aEliminar, setAEliminar] = useState<ProyectoInversionPanel | null>(null);
  const [confirmandoLimpiar, setConfirmandoLimpiar] = useState(false);

  const confirmarEliminar = () => {
    if (aEliminar) onEliminar?.(aEliminar.id);
    setAEliminar(null);
  };

  if (proyectos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-[#94a3b8]">
        Todavía no hay proyectos registrados.
      </p>
    );
  }

  return (
    <div>
      {onLimpiar && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setConfirmandoLimpiar(true)}
            className="rounded-md px-1 py-0.5 text-sm font-medium text-red-600 transition-colors hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400 dark:hover:text-red-300"
          >
            Limpiar todo
          </button>
        </div>
      )}
      <ul className="max-h-80 divide-y divide-zinc-200 overflow-y-auto rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
        {proyectos.map((proyecto) => (
          <li key={proyecto.id} className="flex items-center gap-3 px-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{proyecto.empresa}</p>
              <p className="truncate text-xs text-zinc-500 dark:text-[#94a3b8]">
                {ETIQUETA_TIPO[proyecto.tipo]} · {proyecto.sector}
                {proyecto.ubicaciones && ` · ${proyecto.ubicaciones}`} · {formatearFecha(proyecto.fechaAnuncio)}
              </p>
            </div>
            {onEliminar && (
              <button
                type="button"
                onClick={() => setAEliminar(proyecto)}
                className="shrink-0 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                aria-label={`Eliminar el proyecto de ${proyecto.empresa}`}
              >
                <TrashIcon className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      <Alert open={confirmandoLimpiar} onClose={(open) => !open && setConfirmandoLimpiar(false)}>
        <AlertTitle>¿Limpiar todos los proyectos?</AlertTitle>
        <AlertDescription>
          Se borran los {proyectos.length} proyectos registrados y el sitio público queda sin datos de
          alertas de inversión. Esta acción no se puede deshacer.
        </AlertDescription>
        <AlertActions>
          <Button type="button" plain onClick={() => setConfirmandoLimpiar(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              onLimpiar?.();
              setConfirmandoLimpiar(false);
            }}
          >
            Limpiar todo
          </Button>
        </AlertActions>
      </Alert>

      <Alert open={aEliminar !== null} onClose={(open) => !open && setAEliminar(null)}>
        <AlertTitle>¿Eliminar este proyecto?</AlertTitle>
        <AlertDescription>
          Se borra el proyecto de {aEliminar?.empresa} y deja de verse en el sitio público. Esta acción no
          se puede deshacer.
        </AlertDescription>
        <AlertActions>
          <Button type="button" plain onClick={() => setAEliminar(null)}>
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
