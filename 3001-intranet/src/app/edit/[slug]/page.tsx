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
import { obtenerSesion, permisosDeLaSesion } from "@/shared/lib/sesion";
import {
  AvisoSeccionNueva,
  obtenerPlantilla,
  obtenerPaginaPublicada,
  SLUG_PLANTILLA,
  slugDeOrigen,
} from "@/features/editor";
import { EditorClient } from "./editor-client";

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ nueva?: string; volver?: string }>;
}) {
  const [{ slug }, { nueva, volver }] = await Promise.all([params, searchParams]);

  // Verificación de sesión server-side — sin sesión no se monta nada del editor.
  const sesion = await obtenerSesion();
  if (!sesion) {
    redirect("/login");
  }

  // La verificación de si puede acceder al editor visual ahora se hace de forma granular abajo.

  // Verificación GRANULAR por sección — el chequeo de arriba solo mira el rol, así
  // que un Editor sin la llave `editar.intranet.{slug}` de ESTA sección llegaba a ver
  // la carcasa vacía del editor tecleando la URL a mano (sin pasar por el botón), aunque
  // ya no pudiera cargar contenido real ni guardar: eso lo rechaza la API con 403 vía
  // `requierePermisoDeSeccion()`. Esto cierra esa rendija en vez de dejar que la API la
  // tape sola. Superadmin tiene el mismo bypass que en el servidor (`require-permission
  // .middleware.ts`): de lo contrario quedaría fuera de una sección creada por otro rol
  // administrador, que no le concede la llave automáticamente.
  const esSuperadmin = (sesion.rol ?? "").trim().toLowerCase() === "superadmin";
  if (!esSuperadmin) {
    const permisos = await permisosDeLaSesion();
    if (!permisos.includes("acceso.intranet")) {
      redirect("/");
    }
    if (!permisos.includes(`editar.intranet.${slug}`)) {
      redirect(`/${slug}`);
    }
  }

  // Contexto de solo lectura alrededor del lienzo de Puck: barra/pie publicados
  // al editar una sección, o la sección de origen (`?volver=`) al editar la
  // plantilla. `obtenerPaginaPublicada` SÍ puede lanzar (a diferencia de
  // `obtenerPlantilla`, que ya envuelve su propia llamada), así que se atrapa
  // aquí: el editor no puede dejar de abrir porque el panel de contexto falló.
  const esPlantilla = slug === SLUG_PLANTILLA;
  const [plantilla, paginaDeReferencia] = await Promise.all([
    esPlantilla ? Promise.resolve(null) : obtenerPlantilla(),
    esPlantilla
      ? obtenerPaginaPublicada(slugDeOrigen(volver)).catch(() => null)
      : Promise.resolve(null),
  ]);

  return (
    <>
      {/* Solo al venir de «Nueva sección»: es donde se entrega el enlace de la ruta
          recién creada, que es lo que hay que pegar en el menú para poder llegar. */}
      {nueva === "1" && <AvisoSeccionNueva slug={slug} />}
      <EditorClient slug={slug} plantilla={plantilla} paginaDeReferencia={paginaDeReferencia} />
    </>
  );
}
