'use client';

import { useCallback, useEffect, useState } from 'react';
import { aprobarPagina, listarEnRevision, rechazarPagina } from '../services/paginas.service';
import type { PaginaEnRevision } from '../types';

export function useRevisionQueue() {
  const [paginas, setPaginas] = useState<PaginaEnRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listarEnRevision();
      setPaginas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar páginas en revisión');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const aprobar = useCallback(
    async (slug: string) => {
      await aprobarPagina(slug);
      await cargar();
    },
    [cargar],
  );

  const rechazar = useCallback(
    async (slug: string, motivo: string) => {
      await rechazarPagina(slug, motivo);
      await cargar();
    },
    [cargar],
  );

  return { paginas, isLoading, error, aprobar, rechazar };
}
