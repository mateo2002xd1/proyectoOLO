/**
 * PuckEditorWrapper — Editor visual de páginas basado en Puck (real).
 *
 * Monta el editor Puck de @puckeditor/core con la config de bloques de la
 * intranet. El layout se guarda en la API :4000 (DB) vía useEditorActions,
 * unificado con el sitio-web.
 *
 * @see 1-guia-del-proyecto.md §4.4  (@olo/blocks-renderer es única fuente de render)
 * @see 1-guia-del-proyecto.md §4.3  (puck-editor-wrapper.tsx)
 * @see 8-ciclo-editorial.md §1    (Flujo editorial — estados)
 */

"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Puck, createUsePuck, type Data } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { puckConfig } from "@/config/puck.config";
import { resolverRutaDeVuelta } from "../lib/ruta-de-vuelta";
import type { PuckEditorWrapperProps, ContenidoPagina } from "../types/editor.types";

const estadoBadgeColor: Record<string, string> = {
  borrador: "#d97706",
  en_revision: "#2563eb",
  publicado: "#16a34a",
  rechazado: "#dc2626",
};

/** Con selector, para no re-renderizar la cabecera ante cualquier cambio del editor. */
const usePuckSel = createUsePuck();

interface AccionesCabeceraProps {
  slug: string;
  estado: string;
  bloqueado: boolean;
  busy: boolean;
  isSaving: boolean;
  isSendingToReview: boolean;
  /** Punto de la historia de Puck en el que se guardó por última vez. */
  indiceGuardado: number;
  /** Reciben el índice actual para poder marcar hasta dónde quedó guardado. */
  onGuardar: (indiceHistoria: number) => void;
  onEnviar: (indiceHistoria: number) => void;
  onSalir: (hayCambiosSinGuardar: boolean) => void;
}

/**
 * Acciones de la cabecera del editor.
 *
 * Vive dentro del árbol de Puck para poder leer su historia, que es la señal
 * fiable de "aquí se ha tocado algo": cada acción deshacible avanza el índice.
 * Comparar el JSON contra el contenido inicial no vale — Puck no emite `onChange`
 * al montar, así que el primer cambio de verdad se confundía con la línea base y
 * salir descartaba trabajo sin avisar.
 */
function AccionesCabecera({
  slug,
  estado,
  bloqueado,
  busy,
  isSaving,
  isSendingToReview,
  indiceGuardado,
  onGuardar,
  onEnviar,
  onSalir,
}: AccionesCabeceraProps) {
  const indiceHistoria = usePuckSel((s) => s.history.index);
  // Deshacer hasta el punto guardado vuelve a dejarlo limpio, y eso es correcto.
  const hayCambiosSinGuardar = indiceHistoria !== indiceGuardado;

  return (
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
      {hayCambiosSinGuardar && (
        <span style={{ fontSize: 12, color: "#d97706" }}>Sin guardar</span>
      )}
      {/* Salir no es una acción sobre el contenido: se deja en gris para que no
          compita con guardar y enviar. */}
      <button
        type="button"
        onClick={() => onSalir(hayCambiosSinGuardar)}
        disabled={busy}
        title="Volver a la página sin publicar nada"
        style={{
          padding: "7px 16px",
          background: "transparent",
          color: "#374151",
          border: "1px solid #d1d5db",
          borderRadius: 6,
          cursor: busy ? "not-allowed" : "pointer",
          fontWeight: 500,
          fontSize: 14,
        }}
      >
        Salir
      </button>
      <button
        type="button"
        onClick={() => onGuardar(indiceHistoria)}
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
        onClick={() => onEnviar(indiceHistoria)}
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
  );
}

export function PuckEditorWrapper({
  slug,
  initialData,
  onGuardarBorrador,
  onEnviarRevision,
  isSaving = false,
  isSendingToReview = false,
  versionActual,
}: PuckEditorWrapperProps) {
  const router = useRouter();

  // Snapshot del layout actual — actualizado por onChange de Puck
  const currentDataRef = useRef<Data | null>(null);

  // La historia arranca en 0; tras cada guardado exitoso se mueve al punto actual.
  const [indiceGuardado, setIndiceGuardado] = useState(0);

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

  const handleSave = useCallback(
    async (indiceHistoria: number) => {
      // El contenido se toma antes del await, así que corresponde al índice del
      // clic: si alguien sigue editando mientras se guarda, esos cambios quedan
      // fuera y deben seguir contando como pendientes.
      const data = currentDataRef.current ?? initialPuckData;
      await onGuardarBorrador(data as ContenidoPagina);
      // Solo se llega aquí si la API aceptó el borrador.
      setIndiceGuardado(indiceHistoria);
    },
    [onGuardarBorrador, initialPuckData]
  );

  const handleSend = useCallback(
    async (indiceHistoria: number) => {
      // Guardar antes de enviar (contenido siempre consistente). Si el guardado
      // falla no se envía nada a revisión: se quedaría pendiente la versión vieja.
      try {
        await handleSave(indiceHistoria);
      } catch {
        return; // el mensaje ya lo muestra quien gestiona el error
      }
      await onEnviarRevision();
    },
    [handleSave, onEnviarRevision]
  );

  /**
   * Vuelve a la ruta desde la que se abrió el editor. Sin `?volver=` se usa la
   * propia página editada, que en la intranet es siempre `/{slug}`.
   */
  const handleSalir = useCallback(
    (hayCambiosSinGuardar: boolean) => {
      if (
        hayCambiosSinGuardar &&
        !window.confirm(
          "Hay cambios sin guardar.\n\nSi sales ahora se pierden. ¿Salir de todos modos?"
        )
      ) {
        return;
      }
      router.push(resolverRutaDeVuelta(`/${slug}`));
    },
    [router, slug]
  );

  // Un onClick no puede devolver una promesa rechazada; el mensaje de error ya
  // se muestra sobre el editor.
  const alPulsarGuardar = useCallback(
    (indiceHistoria: number) => {
      void handleSave(indiceHistoria).catch(() => undefined);
    },
    [handleSave]
  );

  const alPulsarEnviar = useCallback(
    (indiceHistoria: number) => {
      void handleSend(indiceHistoria).catch(() => undefined);
    },
    [handleSend]
  );

  // Memorizado porque Puck reconstruye su store cada vez que cambia la identidad
  // de `overrides`.
  const overrides = useMemo(
    () => ({
      headerActions: () => (
        <AccionesCabecera
          slug={slug}
          estado={estado}
          bloqueado={bloqueado}
          busy={busy}
          isSaving={isSaving}
          isSendingToReview={isSendingToReview}
          indiceGuardado={indiceGuardado}
          onGuardar={alPulsarGuardar}
          onEnviar={alPulsarEnviar}
          onSalir={handleSalir}
        />
      ),
    }),
    [
      slug,
      estado,
      bloqueado,
      busy,
      isSaving,
      isSendingToReview,
      indiceGuardado,
      alPulsarGuardar,
      alPulsarEnviar,
      handleSalir,
    ]
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 9999 }}>
      <Puck
        config={puckConfig}
        data={initialPuckData}
        onChange={handleChange}
        // El botón "Publish" de serie no llega a dibujarse: `headerActions` lo
        // sustituye por Salir / Guardar / Enviar. `onPublish` queda como no-op.
        onPublish={() => undefined}
        overrides={overrides}
      />
    </div>
  );
}
