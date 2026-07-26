'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pagina, PuckData, Bloque } from '../types';
import { obtenerPaginaEditable, guardarBorrador, enviarARevision } from '../services/paginas.service';
import { getPageSeed, isEmptyContent } from '../lib/page-seeds';

export function usePagina(slug: string) {
  const [pagina, setPagina] = useState<Pagina | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await obtenerPaginaEditable(slug);
        // Sin versión en BD → sembrar el editor con el contenido estático
        // (copia editable) en lugar de abrir en blanco.
        if (isEmptyContent(data?.contenido)) {
          setPagina({
            id: data?.id ?? '',
            slug: data?.slug ?? slug,
            titulo: data?.titulo ?? slug,
            contenido: getPageSeed(slug),
          });
        } else {
          setPagina(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar página');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [slug]);

  const saveDraft = useCallback(async (contenido: PuckData | Bloque[]) => {
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
