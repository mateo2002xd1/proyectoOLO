'use client';

import { useState, useEffect, useCallback } from 'react';
import { PaginaEditable, PuckData, Bloque } from '../types';
import type { Rechazo } from '../components/aviso-rechazo';
import { obtenerPaginaEditable, guardarBorrador, enviarARevision } from '../services/paginas.service';
import { getPageSeed, isEmptyContent } from '../lib/page-seeds';

export function usePagina(slug: string) {
  const [pagina, setPagina] = useState<PaginaEditable | null>(null);
  /**
   * El rechazo que hay que seguir enseñando, guardado aparte del estado de la versión.
   *
   * Antes esto se deducía de `pagina.estado === 'rechazado'`, y por eso `saveDraft` no
   * podía refrescar el estado sin borrar el aviso de paso: guardar crea una versión
   * nueva en borrador, así que en cuanto se toca algo el estado deja de ser
   * 'rechazado'. Son dos cosas distintas —en qué estado está la versión, y qué le
   * señalaron a quien edita—, y separarlas permite que el botón «Enviar a revisión» se
   * entere de que ya hay borrador sin que el motivo del rechazo desaparezca de la
   * pantalla justo cuando hace falta para corregirlo.
   */
  const [rechazo, setRechazo] = useState<Rechazo | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await obtenerPaginaEditable(slug);
        if (data?.estado === 'rechazado') {
          setRechazo({
            motivo: data.motivoRechazo ?? null,
            numeroVersion: data.numeroVersion ?? null,
          });
        }
        // Sin versión en BD → sembrar el editor con el contenido estático
        // (copia editable) en lugar de abrir en blanco.
        if (isEmptyContent(data?.contenido)) {
          setPagina({
            id: data?.id ?? '',
            slug: data?.slug ?? slug,
            titulo: data?.titulo ?? slug,
            contenido: getPageSeed(slug),
            estado: data?.estado ?? null,
            versionId: data?.versionId ?? null,
            numeroVersion: data?.numeroVersion ?? null,
            motivoRechazo: data?.motivoRechazo ?? null,
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
      // La versión que devuelve la API es la que acaba de crearse, y es la que manda:
      // guardar deja la página en borrador aunque el editor se hubiera abierto sobre la
      // versión publicada. Sin este refresco la cabecera seguía diciendo «Publicado» y
      // «Enviar a revisión» se quedaba desactivado el resto de la sesión, con el
      // borrador ya guardado en la base y sin más salida que recargar la pantalla.
      setPagina((prev) =>
        prev
          ? {
              ...prev,
              contenido,
              estado: result.version.estado,
              versionId: result.version.id,
              numeroVersion: result.version.numeroVersion,
            }
          : null
      );
      // `rechazo` se deja intacto a propósito: el aviso debe seguir visible mientras
      // quien edita corrige lo que le señalaron.
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      throw err;
    }
  }, [slug]);

  const submitForReview = useCallback(async () => {
    try {
      const result = await enviarARevision(slug);
      setPagina((prev) =>
        prev
          ? {
              ...prev,
              estado: result.version.estado,
              versionId: result.version.id,
              numeroVersion: result.version.numeroVersion,
            }
          : null
      );
      // La corrección ya está enviada: el rechazo anterior deja de tener que avisar de
      // nada, y dejarlo puesto haría creer que la versión recién mandada también se
      // rechazó.
      setRechazo(undefined);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar a revisión');
      throw err;
    }
  }, [slug]);

  return { pagina, rechazo, isLoading, error, setError, saveDraft, submitForReview };
}
