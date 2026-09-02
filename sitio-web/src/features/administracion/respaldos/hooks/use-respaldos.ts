'use client';

import { useEffect, useState } from 'react';
import { listarRespaldos } from '../services/respaldos.service';
import type { RegistroRespaldo } from '../types';

export function useRespaldos() {
  const [registros, setRegistros] = useState<RegistroRespaldo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      setIsLoading(true);
      try {
        const data = await listarRespaldos();
        if (cancelado) return;
        setRegistros(data);
        setError(null);
      } catch (err) {
        if (cancelado) return;
        setError(err instanceof Error ? err.message : 'Error al cargar los respaldos');
        setRegistros([]);
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  return { registros, isLoading, error };
}
