'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  aprobarPagina,
  eliminarVersion,
  listarEnRevision,
  rechazarPagina,
} from '../services/revision.service';
import { notificarRevisionActualizada } from '../../model/eventos';
import { esFalloDeConexion, mensajeDeErrorApi } from '@/shared/lib/api/errores-api';
import type { PaginaEnRevision, Ambito } from '../../model/pagina.types';

const MENSAJE_POR_DEFECTO = 'No se pudieron cargar las páginas en revisión.';

/**
 * Esperas antes de cada reintento cuando la API no contestó. Dos y no más: el primer
 * intento suele despertar a Neon y abrir la conexión aunque el navegador se canse
 * antes (la API sigue y la deja lista), así que el segundo casi siempre entra. Con el
 * `timeout` de 15 s, lo peor son unos 50 s de loader antes del aviso.
 */
const ESPERAS_REINTENTO_MS = [1000, 3000];

/** `listarEnRevision` que reintenta solo si no hubo respuesta; un 4xx o 5xx sale al primero. */
async function listarConReintentos(cancelado: () => boolean): Promise<PaginaEnRevision[]> {
  for (let intento = 0; ; intento++) {
    try {
      return await listarEnRevision();
    } catch (err) {
      const espera = ESPERAS_REINTENTO_MS[intento];
      if (!esFalloDeConexion(err) || espera === undefined || cancelado()) throw err;
      await new Promise((resolver) => setTimeout(resolver, espera));
    }
  }
}

export function useRevisionQueue() {
  const [paginas, setPaginas] = useState<PaginaEnRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setIsLoading(true);
    try {
      const data = await listarConReintentos(() => false);
      setPaginas(data);
      setError(null);
    } catch (err) {
      setError(mensajeDeErrorApi(err, MENSAJE_POR_DEFECTO));
    } finally {
      if (!silencioso) setIsLoading(false);
    }
  }, []);

  // Carga inicial. Va dentro de una función async propia (y no llamando a
  // `cargar`) para no ejecutar setState de forma síncrona en el cuerpo del
  // efecto, y para poder descartar la respuesta si el componente se desmonta.
  // También recarga, sin loader, cuando otra parte del panel avisa de un cambio.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const data = await listarConReintentos(() => cancelado);
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
