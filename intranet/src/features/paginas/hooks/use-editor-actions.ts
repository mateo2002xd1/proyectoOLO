/**
 * Hook de acciones del editor — encapsula guardarBorrador y enviarARevision.
 *
 * Centraliza el estado de loading y los llamados a la API para que
 * PuckEditorWrapper sea solo UI y no conozca los detalles del fetch.
 *
 * Regla de oro §0.5: los Use Cases no conocen Express; aquí el hook
 * no conoce los detalles de transporte — solo llama funciones de api/.
 *
 * @see 8-ciclo-editorial.md §1  (Flujo editorial — máquina de estados)
 * @see 1-guia-del-proyecto.md §4.3 (hooks/use-editor-actions.ts)
 */

"use client";

import { useState, useCallback } from "react";
import {
  guardarBorrador,
  enviarARevision,
} from "../api/paginas.api";
import type { ContenidoPagina, EstadoPagina } from "../types/editor.types";

interface UseEditorActionsOptions {
  slug: string;
  /** ID de la versión activa (se obtiene al guardar por primera vez) */
  initialVersionId?: string | null;
  /** Estado editorial inicial de la versión cargada */
  initialEstado?: EstadoPagina | null;
}

interface UseEditorActionsReturn {
  /** Guarda el JSON de Puck como borrador en la API */
  handleGuardarBorrador: (contenido: ContenidoPagina) => Promise<void>;
  /** Envía la versión activa a revisión (requiere haber guardado primero) */
  handleEnviarRevision: () => Promise<void>;
  isSaving: boolean;
  isSendingToReview: boolean;
  /** Estado editorial de la versión activa (actualizado tras cada acción) */
  estadoActual: EstadoPagina | null;
  /** ID de la versión activa (necesario para enviar a revisión) */
  versionId: string | null;
  /** Último error ocurrido, null si no hay */
  error: string | null;
}

export function useEditorActions({
  slug,
  initialVersionId = null,
  initialEstado = null,
}: UseEditorActionsOptions): UseEditorActionsReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingToReview, setIsSendingToReview] = useState(false);
  const [versionId, setVersionId] = useState<string | null>(initialVersionId);
  const [estadoActual, setEstadoActual] = useState<EstadoPagina | null>(
    initialEstado ?? (initialVersionId ? "borrador" : null)
  );
  const [error, setError] = useState<string | null>(null);

  const handleGuardarBorrador = useCallback(
    async (contenido: ContenidoPagina) => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await guardarBorrador(slug, contenido);
        if (res?.versionId) {
          setVersionId(res.versionId);
          setEstadoActual(res.estado ?? "borrador");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al guardar el borrador"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [slug]
  );

  const handleEnviarRevision = useCallback(async () => {
    if (!versionId) {
      setError("Debes guardar el borrador antes de enviarlo a revisión.");
      return;
    }
    setIsSendingToReview(true);
    setError(null);
    try {
      const res = await enviarARevision(slug, versionId);
      if (res?.estado) {
        setEstadoActual(res.estado);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al enviar a revisión"
      );
    } finally {
      setIsSendingToReview(false);
    }
  }, [slug, versionId]);

  return {
    handleGuardarBorrador,
    handleEnviarRevision,
    isSaving,
    isSendingToReview,
    estadoActual,
    versionId,
    error,
  };
}
