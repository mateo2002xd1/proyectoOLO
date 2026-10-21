'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { mensajeDeErrorApi } from '@/shared/lib/api/errores-api';
import {
  eliminarCargaProgramaSobresalientes,
  listarCargasProgramaSobresalientes,
  obtenerCargaProgramaSobresalientes,
  subirExcelProgramaSobresalientes,
} from '../services/observatorio.service';
import type { CargaDatos } from '../types';

// Más rápido que el historial (que no cambia solo): mientras hay una carga
// procesando, esto es lo que alimenta la barra de progreso en vivo.
const INTERVALO_SONDEO_MS = 1000;

/**
 * Estado de la tarjeta "Programa + Sobresalientes": el historial de cargas, la
 * subida en curso y el sondeo de la carga recién subida hasta que el worker de
 * `heavy-jobs` termine de procesarla (no hay paso de aprobación — el resultado
 * llega solo).
 */
export function useCargasProgramaSobresalientes() {
  const [cargas, setCargas] = useState<CargaDatos[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargaEnProcesoId, setCargaEnProcesoId] = useState<string | null>(null);
  const sondeoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refrescar = useCallback(async () => {
    try {
      setCargas(await listarCargasProgramaSobresalientes());
    } catch (err) {
      setError(mensajeDeErrorApi(err, 'No se pudo cargar el historial de cargas.'));
    } finally {
      setCargando(false);
    }
  }, []);

  // Lectura inicial del historial. La regla marca cualquier `setState` alcanzable desde
  // un efecto, incluido el que ocurre *después* del `await` — y aquí no hay otra forma:
  // este es un panel de cliente, el dato llega por red y el estado no puede existir
  // antes que la respuesta. Ver §9 de 2-convenciones-del-proyecto.md.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refrescar();
  }, [refrescar]);

  /** Mientras haya una carga en "procesando", pregunta cada segundo hasta que resuelva. */
  const sondearHastaResolver = useCallback((cargaId: string) => {
    if (sondeoRef.current) clearInterval(sondeoRef.current);
    setCargaEnProcesoId(cargaId);

    sondeoRef.current = setInterval(async () => {
      try {
        const actualizada = await obtenerCargaProgramaSobresalientes(cargaId);
        setCargas((actual) => actual.map((c) => (c.id === cargaId ? actualizada : c)));

        if (actualizada.estado !== 'procesando') {
          if (sondeoRef.current) {
            clearInterval(sondeoRef.current);
            sondeoRef.current = null;
          }
          setCargaEnProcesoId(null);
        }
      } catch {
        if (sondeoRef.current) clearInterval(sondeoRef.current);
        sondeoRef.current = null;
        setCargaEnProcesoId(null);
      }
    }, INTERVALO_SONDEO_MS);
  }, []);

  useEffect(() => () => {
    if (sondeoRef.current) clearInterval(sondeoRef.current);
  }, []);

  const subirArchivo = useCallback(
    async (archivo: File) => {
      setSubiendo(true);
      setError(null);
      try {
        const { cargaId } = await subirExcelProgramaSobresalientes(archivo);
        await refrescar();
        sondearHastaResolver(cargaId);
      } catch (err) {
        setError(mensajeDeErrorApi(err, 'Error al subir el archivo.'));
      } finally {
        setSubiendo(false);
      }
    },
    [refrescar, sondearHastaResolver]
  );

  // Sin `cargas` en las dependencias a propósito: esta función se pasa como prop a
  // `HistorialCargasGrid`, que recrea la grilla de Handsontable entera cuando cambia
  // de identidad — y `cargas` cambia en cada sondeo (cada segundo mientras hay algo
  // procesando). Si el borrado falla, se resincroniza con `refrescar()` en vez de
  // volver a un snapshot capturado en el cierre.
  const eliminarCarga = useCallback(
    async (id: string) => {
      setError(null);
      setCargas((actual) => actual.filter((c) => c.id !== id));
      try {
        await eliminarCargaProgramaSobresalientes(id);
      } catch (err) {
        setError(mensajeDeErrorApi(err, 'No se pudo eliminar la carga.'));
        await refrescar();
      }
    },
    [refrescar]
  );

  const cargaEnProceso = cargas.find((c) => c.id === cargaEnProcesoId) ?? null;

  return { cargas, cargando, subiendo, error, subirArchivo, cargaEnProceso, eliminarCarga };
}
