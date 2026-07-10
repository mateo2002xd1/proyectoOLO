/**
 * EditorClient — Componente cliente que monta el editor Puck + useEditorActions.
 *
 * Separado de page.tsx para cumplir la regla Server/Client de Next.js App Router:
 *   - page.tsx  → Server Component (carga datos, verifica permisos)
 *   - editor-client.tsx → Client Component (interacción, hooks, estado)
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §9.3  (editor/[slug]/page.tsx)
 * @see ARQUITECTURA_MAESTRA_OLO.md §3    (Flujo editorial)
 */

"use client";

import { PuckEditorWrapper } from "@/features/paginas";
import { useEditorActions } from "@/features/paginas";
import type { PaginaVersion } from "@/features/paginas";

interface EditorClientProps {
  slug: string;
  versionActual: PaginaVersion | null;
}

export function EditorClient({ slug, versionActual }: EditorClientProps) {
  const {
    handleGuardarBorrador,
    handleEnviarRevision,
    isSaving,
    isSendingToReview,
    error,
    estadoActual,
    versionId,
  } = useEditorActions({
    slug,
    initialVersionId: versionActual?.id ?? null,
  });

  return (
    <div className="editor-page">
      {error && (
        <div className="editor-error-banner" role="alert">
          {error}
        </div>
      )}

      {estadoActual === "en_revision" && (
        <div className="editor-status-banner editor-status-en-revision">
          Esta versión está en revisión. Espera la aprobación del Administrador.
        </div>
      )}

      {estadoActual === "publicado" && (
        <div className="editor-status-banner editor-status-publicado">
          Esta versión está publicada. Crea un nuevo borrador para editar.
        </div>
      )}

      <PuckEditorWrapper
        slug={slug}
        initialData={versionActual?.contenido ?? null}
        onGuardarBorrador={handleGuardarBorrador}
        onEnviarRevision={handleEnviarRevision}
        isSaving={isSaving}
        isSendingToReview={isSendingToReview}
        versionActual={
          versionActual
            ? { ...versionActual, estado: estadoActual ?? versionActual.estado }
            : null
        }
      />

      {/* Debug info — solo en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <details style={{ marginTop: "1rem", fontSize: "0.75rem" }}>
          <summary>Debug estado editor</summary>
          <pre>
            {JSON.stringify({ slug, versionId, estadoActual }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
