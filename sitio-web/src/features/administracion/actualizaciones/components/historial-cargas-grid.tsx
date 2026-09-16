'use client';

import { useEffect, useRef, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';
import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/shared/ui/molecules/alert';
import { Button } from '@/shared/ui/atoms/button';
import type { CargaDatos } from '../types';

interface HistorialCargasGridProps {
  cargas: CargaDatos[];
  /** Ausente en solo-lectura (quien no `puedeActualizar` no ve la columna de borrar). */
  onEliminar?: (id: string) => void;
}

const ETIQUETA_ESTADO: Record<CargaDatos['estado'], string> = {
  procesando: 'Procesando...',
  completado: 'Completado',
  error: 'Error',
};

const COLUMNA_ACCIONES = 4;

const etiquetaEstado = (carga: CargaDatos) =>
  carga.estado === 'procesando' ? `Procesando... ${carga.progreso}%` : ETIQUETA_ESTADO[carga.estado];

const formatearFecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

/** Cuadrito "✕" para borrar. También disponible en "procesando": si el worker
 * de verdad la sigue escribiendo no pasa nada al borrarla (la actualización de
 * progreso solo deja de encontrar la fila), y es la única forma de quitar una
 * carga que quedó colgada ahí para siempre (por ejemplo, tras un reinicio del
 * servidor a mitad de camino). */
const renderizarAcciones: Handsontable.renderers.BaseRenderer = (instance, td) => {
  td.textContent = '✕';
  td.style.textAlign = 'center';
  td.style.fontWeight = '600';
  td.style.color = '#dc2626';
  td.style.cursor = 'pointer';
  return td;
};

/**
 * Historial de cargas en una grilla — primer uso real de `handsontable`, que
 * estaba instalado (`sitio-web/package.json`) desde antes sin que ningún archivo
 * lo importara.
 *
 * Se usa la API vanilla (sin `@handsontable/react`, que no está instalado): se
 * instancia sobre un `<div>` por `ref` y se destruye al desmontar. Es de solo
 * lectura para los datos (`readOnly: true`) — la única interacción es la
 * columna "Acciones", resuelta a mano con `afterOnCellMouseDown` porque un
 * renderer de Handsontable no es un `<button>` de React con su propio `onClick`.
 */
export function HistorialCargasGrid({ cargas, onEliminar }: HistorialCargasGridProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const instanciaRef = useRef<Handsontable | null>(null);
  const cargasRef = useRef<CargaDatos[]>(cargas);
  const [cargaAEliminar, setCargaAEliminar] = useState<CargaDatos | null>(null);

  useEffect(() => {
    cargasRef.current = cargas;
  }, [cargas]);

  // Se crea una sola vez (montar/desmontar) y desde entonces solo recibe datos
  // nuevos con `loadData`. Recrearla en cada cambio de `cargas` —que pasa cada
  // segundo mientras hay una carga "procesando"— destruiría y reconstruiría la
  // grilla entera en cada sondeo.
  useEffect(() => {
    if (!contenedorRef.current) return;

    const columnas = onEliminar
      ? ['Fecha', 'Estado', 'Filas cargadas', 'Mensaje', '']
      : ['Fecha', 'Estado', 'Filas cargadas', 'Mensaje'];
    const anchos = onEliminar ? [160, 110, 110, 280, 36] : [160, 110, 110, 300];

    instanciaRef.current = new Handsontable(contenedorRef.current, {
      data: [],
      colHeaders: columnas,
      columns: onEliminar
        ? [{}, {}, { type: 'numeric' }, {}, { renderer: renderizarAcciones }]
        : [{}, {}, { type: 'numeric' }, {}],
      colWidths: anchos,
      readOnly: true,
      disableVisualSelection: true,
      licenseKey: 'non-commercial-and-evaluation',
      height: 'auto',
      width: '100%',
      stretchH: 'all',
      afterOnCellMouseDown: (_event, coords) => {
        if (!onEliminar || coords.col !== COLUMNA_ACCIONES || coords.row < 0) return;
        const carga = cargasRef.current[coords.row];
        if (!carga) return;
        setCargaAEliminar(carga);
      },
    });

    return () => {
      instanciaRef.current?.destroy();
      instanciaRef.current = null;
    };
  }, [onEliminar]);

  useEffect(() => {
    const datos = cargas.map((c) => {
      const fila = [
        formatearFecha(c.creadoEn),
        etiquetaEstado(c),
        c.estado === 'error' ? '—' : c.filasProcesadas,
        c.mensaje ?? '—',
      ];
      if (onEliminar) fila.push('✕');
      return fila;
    });
    instanciaRef.current?.loadData(datos);
  }, [cargas, onEliminar]);

  const confirmarEliminar = () => {
    if (cargaAEliminar) onEliminar?.(cargaAEliminar.id);
    setCargaAEliminar(null);
  };

  return (
    // El contenedor se renderiza siempre — si estuviera detrás de un `if
    // (cargas.length === 0) return ...` el `ref` nunca llegaría a montarse a
    // tiempo para el efecto que crea la instancia, y la grilla no aparecería
    // luego aunque llegaran cargas.
    <div>
      {cargas.length === 0 && (
        <p className="mb-2 text-sm text-gray-500">Todavía no se ha hecho ninguna carga.</p>
      )}
      <div ref={contenedorRef} className="ht-theme-main" hidden={cargas.length === 0} />

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
