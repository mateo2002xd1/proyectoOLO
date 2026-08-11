/**
 * Página del editor visual de la intranet.
 *
 * Server Component mínimo: resuelve el slug, verifica sesión y permisos
 * server-side, y monta <EditorClient> solo si el usuario tiene acceso.
 *
 * Seguridad: la verificación ocurre aquí, en el Server Component, antes de
 * que el cliente reciba cualquier chunk de JavaScript del editor. El middleware
 * global solo decodifica el JWT para decisiones de UX (no verifica firma),
 * por lo que esta capa es indispensable.
 *
 * @see 1-guia-del-proyecto.md §4.3  (editor/[slug]/page.tsx)
 * @see 8-ciclo-editorial.md §1    (Flujo editorial — Borrador → EnRevision)
 * @see 3-seguridad-del-proyecto.md §0.4 (autorización siempre server-side)
 * @see openspec/changes/qa-seguridad-vistas-intranet/specs/qa-intranet-editor-authz/spec.md
 */

import { redirect } from "next/navigation";
import { obtenerSesion, puedeEditarPaginas } from "@/shared/lib/sesion";
import { EditorClient } from "./editor-client";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Verificación de sesión server-side — sin sesión no se monta nada del editor.
  const sesion = await obtenerSesion();
  if (!sesion) {
    redirect("/auth");
  }

  // Verificación de permiso de edición — directores/subdirectores tienen sesión
  // pero no pueden editar: se les devuelve a la vista de la página.
  const puedeEditar = await puedeEditarPaginas();
  if (!puedeEditar) {
    redirect(`/${slug}`);
  }

  return <EditorClient slug={slug} />;
}
