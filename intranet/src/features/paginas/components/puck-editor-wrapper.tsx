/**
 * PuckEditorWrapper — Editor visual de páginas basado en Puck (real).
 *
 * Monta el editor Puck de @puckeditor/core con la config de bloques de la
 * intranet. El layout se guarda en la API :4000 (DB) vía useEditorActions,
 * unificado con el sitio-web.
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §0.2  (@olo/blocks-renderer es única fuente de render)
 * @see ARQUITECTURA_MAESTRA_OLO.md §9.3  (puck-editor-wrapper.tsx)
 * @see ARQUITECTURA_MAESTRA_OLO.md §3    (Flujo editorial — estados)
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { puckConfig } from "@/config/puck.config";
import type { PuckEditorWrapperProps, ContenidoPagina } from "../types/editor.types";

const estadoBadgeColor: Record<string, string> = {
  borrador: "#d97706",
  en_revision: "#2563eb",
  publicado: "#16a34a",
  rechazado: "#dc2626",
};

export function PuckEditorWrapper({
  slug,
  initialData,
  onGuardarBorrador,
  onEnviarRevision,
  isSaving = false,
  isSendingToReview = false,
  versionActual,
}: PuckEditorWrapperProps) {
  // Snapshot del layout actual — actualizado por onChange de Puck
  const currentDataRef = useRef<Data | null>(null);

  // Datos iniciales con identidad estable (evita re-montar Puck en cada render).
  // Va en useState con inicializador diferido, no en useRef: los refs no deben
  // leerse durante el render, y asi el objeto se construye una sola vez.
  const [initialPuckData] = useState<Data>(
    () => (initialData as Data) ?? { content: [], root: {} }
  );

  const estado = versionActual?.estado ?? "borrador";
  const bloqueado = estado === "en_revision" || estado === "publicado";
  const busy = isSaving || isSendingToReview;

  const handleChange = useCallback((data: Data) => {
    currentDataRef.current = data;
  }, []);

  const handleSave = useCallback(async () => {
    const data = currentDataRef.current ?? initialPuckData;
    await onGuardarBorrador(data as ContenidoPagina);
  }, [onGuardarBorrador, initialPuckData]);

  const handleSend = useCallback(async () => {
    // Guardar antes de enviar (contenido siempre consistente)
    await handleSave();
    await onEnviarRevision();
  }, [handleSave, onEnviarRevision]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 9999 }}>
      <Puck
        config={puckConfig}
        data={initialPuckData}
        onChange={handleChange}
        onPublish={handleSave}
        overrides={{
          headerActions: () => (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>/{slug}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "capitalize",
                  color: estadoBadgeColor[estado] ?? "#666",
                }}
              >
                {estado.replace("_", " ")}
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                style={{
                  padding: "7px 16px",
                  background: busy ? "#93c5fd" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: busy ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                {isSaving ? "Guardando…" : "Guardar borrador"}
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={busy || bloqueado}
                style={{
                  padding: "7px 16px",
                  background: busy || bloqueado ? "#6ee7b7" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: busy || bloqueado ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                {isSendingToReview ? "Enviando…" : "Enviar a revisión"}
              </button>
            </div>
          ),
        }}
      />
    </div>
  );
}
