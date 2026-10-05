'use client';

import { useCallback, useEffect, useState } from 'react';
import { mensajeDeErrorApi } from '@/shared/lib/errores-api';
import {
  eliminarCargaFuentesFuturas,
  listarCargasFuentesFuturas,
  subirExcelFuentesFuturas,
} from '../services/observatorio.service';
import type { CargaDatos } from '../types';

/**
 * Estado de la tarjeta "Fuentes futuras de empleo". Más corto que los otros hooks de
 * "Actualizaciones" porque esta carga no pasa por la cola: la respuesta del POST ya trae
 * la carga terminada, así que no hay sondeo ni barra de progreso que mantener.
 */
export function useCargasFuentesFuturas() {
  const [cargas, setCargas] = useState<CargaDatos[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const refrescar = useCallback(async () => {
    try {
      setCargas(await listarCargasFuentesFuturas());
    } catch {
      setError('No se pudo cargar el historial de cargas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refrescar();
  }, [refrescar]);

  const subirArchivo = useCallback(
    async (archivo: File) => {
      setSubiendo(true);
      setError(null);
      setAviso(null);
      try {
        const { filas } = await subirExcelFuentesFuturas(archivo);
        setAviso(`Listo: ${filas.toLocaleString('es-CO')} registros publicados en el sitio.`);
        await refrescar();
      } catch (err) {
        setError(mensajeDeErrorApi(err, 'Error al subir el archivo.'));
      } finally {
        setSubiendo(false);
      }
    },
    [refrescar]
  );

  const eliminarCarga = useCallback(
    async (id: string) => {
      setError(null);
      setAviso(null);
      // Optimista, como en las demás tarjetas; si falla, `refrescar` devuelve la fila.
      setCargas((actual) => actual.filter((carga) => carga.id !== id));
      try {
        await eliminarCargaFuentesFuturas(id);
        await refrescar();
      } catch (err) {
        setError(mensajeDeErrorApi(err, 'No se pudo eliminar la carga.'));
        await refrescar();
      }
    },
    [refrescar]
  );

  return { cargas, cargando, subiendo, error, aviso, subirArchivo, eliminarCarga, refrescar };
}
