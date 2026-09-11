/**
 * EditorClient — Componente cliente que carga el contenido editable desde la
 * API (:4000, DB) y monta el editor Puck real.
 *
 * Separado de page.tsx para cumplir la regla Server/Client de Next.js:
 *   - page.tsx  → Server Component (routing)
 *   - editor-client.tsx → Client Component (carga de datos + editor Puck)
 *
 * @see 1-guia-del-proyecto.md §4.3  (editor/[slug]/page.tsx)
 * @see 8-ciclo-editorial.md §1    (Flujo editorial)
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PuckEditorWrapper,
  AvisoEditorOcupado,
  useEditorActions,
  useBloqueoDeEdicion,
  obtenerVersionEditable,
  getPageSeed,
  isEmptyContent,
  type VersionEditable,
  type PaginaVersion,
  type Plantilla,
  type PaginaPublicada,
} from "@/features/gestor-secciones";
import type { ContextoDeEdicion } from "@/config/puck.config";
import { GooLoader } from "@/shared/ui/atoms/GooLoader";

interface EditorClientProps {
  slug: string;
  /** Barra/pie publicados, para mostrarlos bloqueados alrededor de una sección. */
  plantilla?: Plantilla | null;
  /** La sección de la que venía quien edita, para mostrarla bloqueada bajo la plantilla. */
  paginaDeReferencia?: PaginaPublicada | null;
}

// Tiempo mínimo del loader para que la animación se complete antes de mostrar el editor.
// Debe coincidir con el editor del sitio-web para que ambos se comporten igual.
const MIN_LOADER_MS = 8000;

export function EditorClient({ slug, plantilla, paginaDeReferencia }: EditorClientProps) {
  const [editable, setEditable] = useState<VersionEditable | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Se pide antes que nada: si la sección la tiene otra persona, no tiene sentido
  // ni cargar su contenido.
  const bloqueo = useBloqueoDeEdicion(slug);

  // Mantiene el loader visible al menos MIN_LOADER_MS aunque los datos carguen antes.
  const [minTimePassed, setMinTimePassed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let active = true;
    obtenerVersionEditable(slug)
      .then((data) => {
        if (!active) return;
        // Sin versión en BD → sembrar el editor con el contenido estático
        // (copia editable) en lugar de abrir en blanco.
        if (isEmptyContent(data.contenido)) {
          setEditable({ ...data, contenido: getPageSeed(slug) });
        } else {
          setEditable(data);
        }
      })
      .catch((err) => {
        if (active) setLoadError(err instanceof Error ? err.message : "No se pudo cargar la página");
      });
    return () => { active = false; };
  }, [slug]);

  // La tiene otra persona: se corta aquí, antes de montar nada del editor.
  if (bloqueo.estado === "ajeno") {
    return (
      <AvisoEditorOcupado
        nombre={bloqueo.bloqueadoPor ?? "Otra persona"}
        puedeForzar={bloqueo.puedeForzar}
        onReintentar={bloqueo.reintentar}
        rutaDeVuelta={`/${slug}`}
      />
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>No se pudo abrir el editor</h1>
        <p>{loadError}</p>
      </div>
    );
  }

  if (!editable || !minTimePassed || bloqueo.estado === "pidiendo") {
    return (
      <div className="editor-loading-overlay">
        <GooLoader label="Cargando editor..." />
      </div>
    );
  }

  return (
    <EditorMounted
      slug={slug}
      editable={editable}
      plantilla={plantilla}
      paginaDeReferencia={paginaDeReferencia}
      // Solo importa el caso «nos lo quitaron»: los otros ya se resolvieron arriba.
      candadoPerdidoPor={bloqueo.estado === "perdido" ? bloqueo.bloqueadoPor : null}
    />
  );
}

/**
 * Se monta SOLO cuando el contenido ya está cargado, para que useEditorActions
 * se inicialice con el versionId/estado reales (los hooks no releen sus valores
 * iniciales tras el primer render).
 */
function EditorMounted({
  slug,
  editable,
  plantilla,
  paginaDeReferencia,
  candadoPerdidoPor,
}: {
  slug: string;
  editable: VersionEditable;
  plantilla?: Plantilla | null;
  paginaDeReferencia?: PaginaPublicada | null;
  /** Nombre de quien nos quitó el candado, si pasó. */
  candadoPerdidoPor?: string | null;
}) {
  const {
    handleGuardarBorrador,
    handleEnviarRevision,
    isSaving,
    isSendingToReview,
    estadoActual,
    rechazo,
    error,
  } = useEditorActions({
    slug,
    initialVersionId: editable.versionId,
    initialEstado: editable.estado,
    initialRechazo:
      editable.estado === "rechazado"
        ? { motivo: editable.motivoRechazo, numeroVersion: editable.numeroVersion }
        : undefined,
  });

  const versionActual = {
    estado: estadoActual ?? editable.estado ?? "borrador",
    contenido: editable.contenido,
    slug: editable.slug,
    titulo: editable.titulo,
  } as PaginaVersion;

  // Identidad estable: si este objeto cambia, Puck reconstruye su store y el
  // editor se reinicia con lo que se llevara sin guardar.
  const contexto = useMemo<ContextoDeEdicion>(
    () => ({
      plantilla: plantilla ?? null,
      seccion: paginaDeReferencia
        ? { slug: paginaDeReferencia.slug, contenido: paginaDeReferencia.contenido }
        : null,
    }),
    [plantilla, paginaDeReferencia]
  );

  return (
    <>
      {error && (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10000,
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#dc2626",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}
      <PuckEditorWrapper
        slug={slug}
        initialData={editable.contenido}
        onGuardarBorrador={handleGuardarBorrador}
        onEnviarRevision={handleEnviarRevision}
        isSaving={isSaving}
        isSendingToReview={isSendingToReview}
        rechazo={rechazo}
        versionActual={versionActual}
        contexto={contexto}
        candadoPerdidoPor={candadoPerdidoPor}
      />
    </>
  );
}
