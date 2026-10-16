'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  aprobarPagina,
  eliminarVersion,
  listarEnRevision,
  rechazarPagina,
} from '../services/revision.service';
import { notificarRevisionActualizada } from '../../model/eventos';
import { mensajeDeErrorApi } from '@/shared/lib/errores-api';
import type { PaginaEnRevision, Ambito } from '../../model/pagina.types';

const MENSAJE_POR_DEFECTO = 'No se pudieron cargar las páginas en revisión.';

export function useRevisionQueue() {
  const [paginas, setPaginas] = useState<PaginaEnRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setIsLoading(true);
    try {
      const data = await listarEnRevision();
      setPaginas(data);
      setError(null);
    } catch (err) {
      setError(mensajeDeErrorApi(err, MENSAJE_POR_DEFECTO));
    } finally {
      if (!silencioso) setIsLoading(false);
    }
  }, []);

  // Carga inicial directa sin bucle de reintentos artificiales, igual que en Usuarios y Roles.
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
        setError(mensajeDeErrorApi(err, MENSAJE_POR_DEFECTO));
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    })();

    const handleActualizacion = () => {
      if (!cancelado) cargar(true);
    };

    window.addEventListener('olo:revision-actualizada', handleActualizacion);

    return () => {
      cancelado = true;
      window.removeEventListener('olo:revision-actualizada', handleActualizacion);
    };
  }, [cargar]);

  const aprobar = useCallback(
    async (slug: string, ambito: Ambito) => {
      await aprobarPagina(slug, ambito);
      await cargar(true);
      notificarRevisionActualizada({ slug });
    },
    [cargar],
  );

  const rechazar = useCallback(
    async (slug: string, motivo: string, ambito: Ambito) => {
      await rechazarPagina(slug, motivo, ambito);
      await cargar(true);
      notificarRevisionActualizada({ slug });
    },
    [cargar],
  );

  const eliminar = useCallback(
    async (slug: string, versionId: string, motivo: string | null, ambito: Ambito) => {
      await eliminarVersion(slug, versionId, motivo, ambito);
      await cargar(true);
      notificarRevisionActualizada({ slug, id: versionId });
    },
    [cargar],
  );

  const reintentar = useCallback(() => {
    return cargar(false);
  }, [cargar]);

  return { paginas, isLoading, error, reintentar, aprobar, rechazar, eliminar };
}
