/**
 * EditorJsWrapper — Envuelve Editor.js con carga dinámica (ssr: false).
 *
 * Editor.js manipula el DOM directamente, por eso NUNCA puede ejecutarse
 * en el servidor. Se importa con next/dynamic + ssr:false.
 *
 * Responsabilidad: contenido rico de texto dentro de un bloque Puck de
 * tipo RichText (párrafos, headings, listas, imágenes inline).
 *
 * TODO: Fase 6 — instalar dependencias:
 *   npm install @editorjs/editorjs @editorjs/paragraph @editorjs/header
 *               @editorjs/list @editorjs/image @editorjs/quote
 *   npm install --save-dev @types/editorjs__editorjs (si existe)
 *
 * @see 1-guia-del-proyecto.md §4.3 (editorjs-wrapper.tsx)
 */

"use client";

import dynamic from "next/dynamic";
import type { EditorJsWrapperProps } from "../types/editor.types";

// ---------------------------------------------------------------------------
// Carga dinámica sin SSR — obligatorio para Editor.js
// ---------------------------------------------------------------------------

// TODO: Fase 6 — reemplazar EditorJsInner por la implementación real
const EditorJsInner = dynamic(
  () =>
    Promise.resolve(function EditorJsInner(props: EditorJsWrapperProps) {
      return (
        <div
          data-editorjs-stub={props.placeholder ?? "Escribe aquí…"}
          style={{
            minHeight: 120,
            border: "1px dashed #ccc",
            borderRadius: 6,
            padding: "0.75rem",
            color: "#666",
            fontSize: "0.875rem",
          }}
        >
          {/* TODO: Fase 6 — Editor.js real */}
          <p style={{ margin: 0, opacity: 0.6 }}>
            Editor.js (stub) — instalar @editorjs/editorjs para activar
          </p>
          {props.initialBlocks && props.initialBlocks.length > 0 && (
            <pre style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
              {JSON.stringify(props.initialBlocks, null, 2)}
            </pre>
          )}
        </div>
      );
    }),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: 120,
          border: "1px dashed #ccc",
          borderRadius: 6,
          padding: "0.75rem",
          color: "#aaa",
          fontSize: "0.875rem",
        }}
      >
        Cargando editor…
      </div>
    ),
  }
);

// ---------------------------------------------------------------------------
// Componente exportado
// ---------------------------------------------------------------------------

/**
 * Uso dentro de un bloque Puck de tipo RichText:
 *
 * ```tsx
 * // En puck-editor-wrapper.tsx, campo del bloque RichText:
 * render: ({ blocks, onChange }) => (
 *   <EditorJsWrapper
 *     initialBlocks={blocks}
 *     onChange={onChange}
 *     placeholder="Escribe el contenido…"
 *   />
 * )
 * ```
 */
export function EditorJsWrapper(props: EditorJsWrapperProps) {
  return <EditorJsInner {...props} />;
}
