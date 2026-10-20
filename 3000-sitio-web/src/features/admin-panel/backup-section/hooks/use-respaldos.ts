'use client';

import { useEffect, useState } from 'react';
import { mensajeDeErrorApi } from '@/shared/lib/errores-api';
import { listarRespaldos } from '../services/respaldos.service';
import type { RegistroRespaldo } from '../types';

export function useRespaldos() {
  const [registros, setRegistros] = useState<RegistroRespaldo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = async (silencioso = false) => {
    if (!silencioso) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const data = await listarRespaldos();
      setRegistros(data);
      setError(null);
    } catch (err) {
      // Traducido: con la API caída, axios decía «Network Error», en inglés y sin pista.
      setError(mensajeDeErrorApi(err, 'No se pudieron cargar los respaldos.'));
      if (!silencioso) setRegistros([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Lectura inicial del listado de respaldos: el `setState` real ocurre tras el `await`
  // de `cargar`, no durante el render. La regla no distingue un caso del otro y aquí no
  // hay alternativa sin subir la lectura al servidor. Ver §9 de
  // 2-convenciones-del-proyecto.md.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar(false);
  }, []);

  const recargar = () => {
    return cargar(true);
  };

  /** Tras un fallo de carga: vuelve a pedir el listado entero, con el cargador. */
  const reintentar = () => {
    return cargar(false);
  };

  return { registros, isLoading, isRefreshing, error, recargar, reintentar };
}
