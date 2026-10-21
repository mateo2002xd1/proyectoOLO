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
import { ApiError } from "@/shared/lib/api-client";

/**
 * Lo que la API explica del fallo. El validador de la ruta responde un `error`
 * genérico («Datos inválidos») y el motivo concreto en `detalles` —p. ej. «El
 * comentario es muy corto…»—, que es el que le sirve a quien edita.
 */
function mensajeDeLaApi(err: unknown): string | null {
  if (err instanceof ApiError) {
    const detalles = (err.body as { detalles?: { mensaje?: string }[] } | undefined)?.detalles;
    return detalles?.[0]?.mensaje ?? err.message;
  }
  return err instanceof Error ? err.message : null;
}

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
  /** Guarda el JSON de Puck como borrador en la API. `automatico`: lo lanzó el autoguardado. */
  handleGuardarBorrador: (contenido: ContenidoPagina, opciones?: { automatico?: boolean }) => Promise<void>;
  /**
   * Envía a revisión con su comentario de cambios y, si se pasa, el contenido del
   * editor, que la API guarda y envía en una sola operación. Si falla, muestra el error
   * y **lo relanza**: quien llama no debe dar el envío por hecho.
   */
  handleEnviarRevision: (comentario: string, contenido?: ContenidoPagina) => Promise<void>;
  isSaving: boolean;
  isSendingToReview: boolean;
  /** Estado editorial de la versión activa (actualizado tras cada acción) */
  estadoActual: EstadoPagina | null;
  /** ID de la versión activa (el envío a revisión no lo usa: la API toma el último borrador) */
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
    async (contenido: ContenidoPagina, opciones: { automatico?: boolean } = {}) => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await guardarBorrador(slug, contenido, opciones);
        if (res?.versionId) {
          setVersionId(res.versionId);
          setEstadoActual(res.estado ?? "borrador");
        }
      } catch (err) {
        setError(mensajeDeLaApi(err) ?? "Error al guardar el borrador");
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

  // Sin guarda de `versionId` a propósito. El editor guarda justo antes de enviar, en el
  // mismo clic, y esta función se creó en el render anterior a ese guardado: en una
  // sección nueva veía `versionId` en null y cortaba el envío. Si de verdad no hay
  // borrador, la API lo dice («No hay borrador para enviar a revisión»).
  const handleEnviarRevision = useCallback(async (comentario: string, contenido?: ContenidoPagina) => {
    setIsSendingToReview(true);
    setError(null);
    try {
      const res = await enviarARevision(slug, comentario, contenido);
      if (res?.estado) {
        setEstadoActual(res.estado);
      }
      // Con el contenido en el envío puede haberse creado una versión nueva: es esa.
      if (res?.versionId) {
        setVersionId(res.versionId);
      }
      // La corrección ya está enviada: el rechazo anterior deja de tener que avisar
      // de nada, y dejarlo puesto haría creer que la versión recién mandada también
      // se rechazó.
      setRechazo(undefined);
    } catch (err) {
      setError(mensajeDeLaApi(err) ?? "Error al enviar a revisión");
      // Antes el error se quedaba aquí y el editor enseñaba «Tu edición se envió con
      // éxito» igual, con la versión todavía en borrador. Se relanza, como hace
      // `handleGuardarBorrador`, para que la pantalla de éxito solo salga si la API
      // aceptó el envío.
      throw err;
    } finally {
      setIsSendingToReview(false);
    }
  }, [slug]);

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
