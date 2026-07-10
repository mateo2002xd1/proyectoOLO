/**
 * PuckEditorWrapper — Editor visual de páginas basado en Puck.
 *
 * Puck gestiona el layout: qué bloques existen, en qué orden y columnas.
 * Editor.js vive *dentro* del bloque RichText como campo custom de Puck.
 *
 * La config de bloques (puckConfig) define la paleta disponible.
 * Debe crecer en paralelo con @olo/blocks-renderer para que el renderer
 * pueda pintar exactamente lo que el editor puede crear (§0.2).
 *
 * TODO: Fase 6 — instalar Puck:
 *   npm install @measured/puck
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §0.2  (@olo/blocks-renderer es única fuente de render)
 * @see ARQUITECTURA_MAESTRA_OLO.md §9.3  (puck-editor-wrapper.tsx)
 * @see ARQUITECTURA_MAESTRA_OLO.md §3    (Flujo editorial — estados)
 */

"use client";

// TODO: Fase 6 — descomentar cuando Puck esté instalado:
// import { Puck, type Config, type Data } from "@measured/puck";
// import "@measured/puck/puck.css";

import { EditorJsWrapper } from "./editorjs-wrapper";
import { useEditorActions } from "../hooks/use-editor-actions";
import type {
  PuckEditorWrapperProps,
  ContenidoPagina,
  BloqueEditorJs,
} from "../types/editor.types";

// ---------------------------------------------------------------------------
// Configuración de bloques (paleta del editor)
// ---------------------------------------------------------------------------
// TODO: Fase 6 — reemplazar por Config tipada de Puck cuando esté instalado
// TODO: Fase 3 — alinear tipos de props con @olo/types.Bloque

/**
 * Paleta de bloques disponibles en el editor.
 * Cada entrada aquí debe tener su contrapartida en @olo/blocks-renderer.
 *
 * Bloques definidos por ahora (se expande en Fase 6):
 *   - RichText   → contenido enriquecido con Editor.js
 *   - Hero       → imagen + título + subtítulo
 *   - Imagen     → imagen con caption
 *   - Separador  → línea divisoria
 */
const PUCK_BLOCKS_STUB = [
  { type: "RichText", label: "Texto enriquecido" },
  { type: "Hero", label: "Hero / Cabecera" },
  { type: "Imagen", label: "Imagen" },
  { type: "Separador", label: "Separador" },
] as const;

// ---------------------------------------------------------------------------
// Componente editor visual
// ---------------------------------------------------------------------------

/**
 * Uso en editor/[slug]/page.tsx:
 *
 * ```tsx
 * <PuckEditorWrapper
 *   slug={slug}
 *   initialData={versionActual?.contenido ?? null}
 *   onGuardarBorrador={handleGuardarBorrador}
 *   onEnviarRevision={handleEnviarRevision}
 *   isSaving={isSaving}
 *   isSendingToReview={isSendingToReview}
 *   versionActual={versionActual}
 * />
 * ```
 */
export function PuckEditorWrapper({
  slug,
  initialData,
  onGuardarBorrador,
  onEnviarRevision,
  isSaving = false,
  isSendingToReview = false,
  versionActual,
}: PuckEditorWrapperProps) {
  // Muestra el estado editorial actual en la barra del editor
  const estadoBadgeColor: Record<string, string> = {
    borrador: "#d97706",
    en_revision: "#2563eb",
    publicado: "#16a34a",
    rechazado: "#dc2626",
  };
  const estado = versionActual?.estado ?? "borrador";

  return (
    <div className="puck-editor-shell">
      {/* ------------------------------------------------------------------ */}
      {/* Barra superior del editor                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="puck-editor-topbar">
        <span className="puck-editor-slug">/{slug}</span>

        <span
          className="puck-editor-estado"
          style={{ color: estadoBadgeColor[estado] ?? "#666" }}
        >
          {estado.replace("_", " ")}
        </span>

        {versionActual?.motivoRechazo && (
          <span className="puck-editor-rechazo">
            Motivo: {versionActual.motivoRechazo}
          </span>
        )}

        <div className="puck-editor-actions">
          <button
            type="button"
            className="puck-btn puck-btn-secondary"
            onClick={() =>
              onGuardarBorrador(
                initialData ?? { content: [], root: {}, zones: {} }
              )
            }
            disabled={isSaving || isSendingToReview}
          >
            {isSaving ? "Guardando…" : "Guardar borrador"}
          </button>

          <button
            type="button"
            className="puck-btn puck-btn-primary"
            onClick={onEnviarRevision}
            disabled={
              isSaving ||
              isSendingToReview ||
              estado === "en_revision" ||
              estado === "publicado"
            }
          >
            {isSendingToReview ? "Enviando…" : "Enviar a revisión"}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Zona del editor Puck                                                */}
      {/* TODO: Fase 6 — reemplazar este stub por el componente Puck real     */}
      {/* ------------------------------------------------------------------ */}
      <div className="puck-editor-canvas">
        {/* STUB: lista de bloques disponibles */}
        <aside className="puck-editor-sidebar">
          <p className="puck-editor-sidebar-title">Bloques disponibles</p>
          {PUCK_BLOCKS_STUB.map((b) => (
            <div key={b.type} className="puck-editor-block-item">
              {b.label}
            </div>
          ))}
          <p className="puck-editor-sidebar-note">
            TODO: Fase 6 — Instalar @measured/puck para activar el editor real
          </p>
        </aside>

        {/* STUB: lienzo de edición — muestra Editor.js en el primer bloque */}
        <main className="puck-editor-lienzo">
          {initialData?.content && initialData.content.length > 0 ? (
            initialData.content.map((bloque, i) => (
              <div key={i} className="puck-editor-bloque-stub">
                <span className="puck-editor-bloque-tipo">{bloque.type}</span>
                {bloque.type === "RichText" && (
                  <EditorJsWrapper
                    initialBlocks={
                      (bloque.props?.blocks as BloqueEditorJs[]) ?? []
                    }
                    placeholder="Escribe el contenido del bloque…"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="puck-editor-empty">
              <p>La página está vacía.</p>
              <p>
                Selecciona un bloque de la paleta para empezar.
                <br />
                <small>
                  (Funcionalidad completa disponible tras instalar
                  @measured/puck en Fase 6)
                </small>
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
