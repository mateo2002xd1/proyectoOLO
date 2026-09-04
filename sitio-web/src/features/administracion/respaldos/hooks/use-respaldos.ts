'use client';

import { useEffect, useState } from 'react';
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
      setError(err instanceof Error ? err.message : 'Error al cargar los respaldos');
      if (!silencioso) setRegistros([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    cargar(false);
  }, []);

  const recargar = () => {
    return cargar(true);
  };

  return { registros, isLoading, isRefreshing, error, recargar };
}
