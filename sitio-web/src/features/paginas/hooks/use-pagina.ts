'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pagina, Bloque } from '../types';
import { obtenerPaginaEditable, guardarBorrador, enviarARevision } from '../services/paginas.service';

export function usePagina(slug: string) {
  const [pagina, setPagina] = useState<Pagina | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await obtenerPaginaEditable(slug);
        setPagina(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar página');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [slug]);

  const saveDraft = useCallback(async (contenido: any) => {
    try {
      const result = await guardarBorrador(slug, contenido);
      setPagina((prev) => prev ? { ...prev, contenido } : null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      throw err;
    }
  }, [slug]);

  const submitForReview = useCallback(async () => {
    try {
      const result = await enviarARevision(slug);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar a revisión');
      throw err;
    }
  }, [slug]);

  return { pagina, isLoading, error, saveDraft, submitForReview };
}
