'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  aprobarPagina,
  eliminarVersion,
  listarEnRevision,
  rechazarPagina,
} from '../services/paginas.service';
import type { PaginaEnRevision, Ambito } from '../types';

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

  // Carga inicial. Va dentro de una función async propia (y no llamando a
  // `cargar`) para no ejecutar setState de forma síncrona en el cuerpo del
  // efecto, y para poder descartar la respuesta si el componente se desmonta.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const data = await listarEnRevision();
        if (cancelado) return;
        setPaginas(data);
        setError(null);
      } catch (err) {
        if (cancelado) return;
        setError(err instanceof Error ? err.message : 'Error al cargar páginas en revisión');
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const aprobar = useCallback(
    async (slug: string, ambito: Ambito) => {
      await aprobarPagina(slug, ambito);
      await cargar();
    },
    [cargar],
  );

  const rechazar = useCallback(
    async (slug: string, motivo: string, ambito: Ambito) => {
      await rechazarPagina(slug, motivo, ambito);
      await cargar();
    },
    [cargar],
  );

  const eliminar = useCallback(
    async (slug: string, versionId: string, ambito: Ambito) => {
      await eliminarVersion(slug, versionId, ambito);
      await cargar();
    },
    [cargar],
  );

  return { paginas, isLoading, error, aprobar, rechazar, eliminar };
}
