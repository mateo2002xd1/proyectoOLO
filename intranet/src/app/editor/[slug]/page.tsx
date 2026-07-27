/**
 * Página del editor visual de la intranet.
 *
 * Server Component mínimo: resuelve el slug y monta <EditorClient>, que carga
 * el contenido editable desde la API (:4000, DB) y monta el editor Puck real.
 *
 * @see 1-guia-del-proyecto.md §4.3  (editor/[slug]/page.tsx)
 * @see 8-ciclo-editorial.md §1    (Flujo editorial — Borrador → EnRevision)
 * @see 3-seguridad-del-proyecto.md §0.4 (autorización siempre server-side)
 */

import { EditorClient } from "./editor-client";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // TODO: Fase 4-5 — Verificar sesión y permiso "edit_post" server-side.
  //   const session = await getSession();
  //   if (!session) redirect("/login");
  //   if (!(await verificarPermiso(session.userId, "edit_post"))) redirect(`/${slug}`);

  return <EditorClient slug={slug} />;
}
