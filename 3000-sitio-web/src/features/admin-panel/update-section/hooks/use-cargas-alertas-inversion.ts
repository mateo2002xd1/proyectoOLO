'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { mensajeDeErrorApi } from '@/shared/lib/errores-api';
import {
  eliminarCargaAlertasInversion,
  eliminarProyectoInversion,
  eliminarTodosLosProyectosInversion,
  listarCargasAlertasInversion,
  listarProyectosInversion,
  obtenerCargaAlertasInversion,
  subirExcelAlertasInversion,
} from '../services/observatorio.service';
import type { CargaDatos, ProyectoInversionPanel } from '../types';

// Mismo intervalo que `use-cargas-programa-sobresalientes`: lo que alimenta la barra
// de progreso en vivo mientras el worker de `heavy-jobs` procesa la carga.
const INTERVALO_SONDEO_MS = 1000;

/**
 * Estado de la tarjeta "Alertas de inversión": historial de cargas y sondeo de la
 * carga recién subida hasta que el worker termine — mismo patrón que
 * `useCargasProgramaSobresalientes`, sin paso de aprobación.
 */
export function useCargasAlertasInversion() {
  const [cargas, setCargas] = useState<CargaDatos[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoInversionPanel[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargaEnProcesoId, setCargaEnProcesoId] = useState<string | null>(null);
  const sondeoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refrescar = useCallback(async () => {
    try {
      const [listaCargas, listaProyectos] = await Promise.all([
        listarCargasAlertasInversion(),
        listarProyectosInversion(),
      ]);
      setCargas(listaCargas);
      setProyectos(listaProyectos);
    } catch (err) {
      setError(mensajeDeErrorApi(err, 'No se pudo cargar el historial de cargas.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refrescar();
  }, [refrescar]);

  const sondearHastaResolver = useCallback((cargaId: string) => {
    if (sondeoRef.current) clearInterval(sondeoRef.current);
    setCargaEnProcesoId(cargaId);

    sondeoRef.current = setInterval(async () => {
      try {
        const actualizada = await obtenerCargaAlertasInversion(cargaId);
        setCargas((actual) => actual.map((c) => (c.id === cargaId ? actualizada : c)));

        if (actualizada.estado !== 'procesando') {
          if (sondeoRef.current) {
            clearInterval(sondeoRef.current);
            sondeoRef.current = null;
          }
          setCargaEnProcesoId(null);
          // Ya terminó de escribir: aparecen los proyectos nuevos de la lista.
          setProyectos(await listarProyectosInversion());
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
        const { cargaId } = await subirExcelAlertasInversion(archivo);
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

  const eliminarCarga = useCallback(
    async (id: string) => {
      setError(null);
      setCargas((actual) => actual.filter((c) => c.id !== id));
      try {
        await eliminarCargaAlertasInversion(id);
      } catch (err) {
        setError(mensajeDeErrorApi(err, 'No se pudo eliminar la carga.'));
        await refrescar();
      }
    },
    [refrescar]
  );

  const eliminarProyecto = useCallback(
    async (id: string) => {
      setError(null);
      setProyectos((actual) => actual.filter((p) => p.id !== id));
      try {
        await eliminarProyectoInversion(id);
      } catch (err) {
        setError(mensajeDeErrorApi(err, 'No se pudo eliminar el proyecto.'));
        await refrescar();
      }
    },
    [refrescar]
  );

  const limpiarProyectos = useCallback(async () => {
    setError(null);
    try {
      await eliminarTodosLosProyectosInversion();
      setProyectos([]);
    } catch (err) {
      setError(mensajeDeErrorApi(err, 'No se pudieron limpiar los proyectos.'));
    }
  }, []);

  const cargaEnProceso = cargas.find((c) => c.id === cargaEnProcesoId) ?? null;

  return {
    cargas,
    proyectos,
    cargando,
    subiendo,
    error,
    subirArchivo,
    cargaEnProceso,
    eliminarCarga,
    eliminarProyecto,
    limpiarProyectos,
    refrescar,
  };
}
