/**
 * Página dinámica protegida de la intranet.
 * Renderiza el contenido publicado de una página por su slug.
 * Muestra el botón lápiz si el usuario tiene permiso de edición.
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §9.3  (intranet: [slug]/page.tsx — protegido, con botón lápiz)
 * @see ARQUITECTURA_MAESTRA_OLO.md §2    (Roles y matriz de acceso)
 * @see ARQUITECTURA_MAESTRA_OLO.md §0.11 (autorización siempre server-side)
 */

import { PageRenderer, EditButton } from "@/features/paginas";
import { obtenerPagina } from "@/features/paginas";

export default async function PaginaSlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // TODO: Fase 4-5 — Verificar sesión. Si no hay sesión → redirect("/login")
  //   const session = await getSession();
  //   if (!session) redirect("/login");

  // TODO: Fase 3 — Obtener contenido publicado desde API :4000
  //   const pagina = await obtenerPagina(slug);
  //   if (!pagina) notFound();
  void obtenerPagina; // evitar lint "unused" hasta Fase 3

  // TODO: Fase 4-5 — Verificar permiso edit_post server-side para mostrar el lápiz
  //   const puedeEditar = await verificarPermiso(session.userId, "edit_post");
  const puedeEditar = false; // stub: false hasta que existan sesión + permisos reales

  return (
    <div className="pagina-slug">
      {/* Botón lápiz — solo visible si tiene permiso (verificado arriba, server-side) */}
      <EditButton slug={slug} hasPermission={puedeEditar} />

      {/* TODO: Fase 3 — Renderizar con @olo/blocks-renderer */}
      <PageRenderer slug={slug} />
    </div>
  );
}
