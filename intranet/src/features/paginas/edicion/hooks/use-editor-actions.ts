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
} from "../services/edicion.service";
import type { ContenidoPagina, EstadoPagina } from "../../model/pagina.types";
import type { Rechazo } from "../components/aviso-rechazo";

interface UseEditorActionsOptions {
  slug: string;
  /** ID de la versión activa (se obtiene al guardar por primera vez) */
  initialVersionId?: string | null;
  /** Estado editorial inicial de la versión cargada */
  initialEstado?: EstadoPagina | null;
  /** Por qué volvió a borrador, si la versión cargada estaba rechazada. */
  initialRechazo?: Rechazo;
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
  /**
   * El rechazo que hay que seguir enseñando, guardado aparte de `estadoActual`.
   *
   * Si se dedujera de `estadoActual === "rechazado"`, guardar un borrador (que
   * deja la versión en "borrador") borraría el aviso a mitad de la corrección,
   * justo cuando más hace falta. Solo se apaga al enviar a revisión con éxito.
   */
  rechazo?: Rechazo;
  /** Último error ocurrido, null si no hay */
  error: string | null;
}

export function useEditorActions({
  slug,
  initialVersionId = null,
  initialEstado = null,
  initialRechazo,
}: UseEditorActionsOptions): UseEditorActionsReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingToReview, setIsSendingToReview] = useState(false);
  const [versionId, setVersionId] = useState<string | null>(initialVersionId);
  const [estadoActual, setEstadoActual] = useState<EstadoPagina | null>(
    initialEstado ?? (initialVersionId ? "borrador" : null)
  );
  const [rechazo, setRechazo] = useState<Rechazo | undefined>(initialRechazo);
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
        // Se relanza además de mostrarlo: quien llama necesita distinguir un
        // guardado real de uno fallido antes de enviar a revisión o de dejar
        // salir del editor dando el contenido por guardado.
        throw err;
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
      // La corrección ya está enviada: el rechazo anterior deja de tener que avisar
      // de nada, y dejarlo puesto haría creer que la versión recién mandada también
      // se rechazó.
      setRechazo(undefined);
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
    rechazo,
    error,
  };
}
