/**
 * Página del editor visual de la intranet.
 * Carga el borrador activo y monta PuckEditorWrapper + EditorJsWrapper.
 *
 * Este es un Server Component que:
 *   1. Verifica sesión y permiso edit_post (Fase 4-5)
 *   2. Carga el borrador activo desde la API (Fase 6)
 *   3. Pasa los datos al componente cliente <EditorClient>
 *
 * La lógica de guardar/enviar a revisión vive en useEditorActions (cliente).
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §9.3  (editor/[slug]/page.tsx)
 * @see ARQUITECTURA_MAESTRA_OLO.md §3    (Flujo editorial — Borrador → EnRevision)
 * @see ARQUITECTURA_MAESTRA_OLO.md §0.11 (autorización siempre server-side)
 */

import { obtenerBorradorActivo } from "@/features/paginas";
import { EditorClient } from "./editor-client";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // TODO: Fase 4-5 — Verificar sesión y permiso "edit_post" server-side.
  //   Si no tiene permiso → redirect("/login") o redirect(`/${slug}`)
  //   Ejemplo:
  //   const session = await getSession();
  //   if (!session) redirect("/login");
  //   const puedeEditar = await verificarPermiso(session.userId, "edit_post");
  //   if (!puedeEditar) redirect(`/${slug}`);

  // TODO: Fase 6 — obtenerBorradorActivo estará activo cuando exista el endpoint
  const versionActual = await obtenerBorradorActivo(slug);

  return (
    <EditorClient
      slug={slug}
      versionActual={versionActual}
    />
  );
}
