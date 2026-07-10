/**
 * API client del módulo de páginas — funciones que consumen la API :4000.
 *
 * Extiende el stub existente con los endpoints necesarios para el editor (Fase 6-7).
 *
 * Endpoints que necesita la API (§9.1):
 *   GET  /paginas/:slug/borrador-activo             → ObtenerBorrador use-case
 *   PUT  /paginas/:slug/versiones                   → GuardarBorrador use-case
 *   POST /paginas/:slug/versiones/:id/enviar-revision → EnviarARevision use-case
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §9.1 (use-cases/paginas/)
 * @see ARQUITECTURA_MAESTRA_OLO.md §5  (API :4000 es la única fuente de JWT/auth)
 */

import { apiClient } from "@/lib/api-client";
import type { ContenidoPagina, PaginaVersion } from "../types/editor.types";

// TODO: Fase 3 — import type { Pagina } from '@olo/types';

// ---------------------------------------------------------------------------
// Lectura de páginas
// ---------------------------------------------------------------------------

export async function obtenerPagina(slug: string) {
  // TODO: Fase 3 — return apiClient.get(`/paginas/${slug}`);
  void apiClient;
  void slug;
  return null;
}

/**
 * Obtiene el borrador activo de una página (estado: borrador | rechazado).
 * Si no existe, devuelve null — el editor parte desde cero.
 *
 * TODO: Fase 6 — descomentar cuando el endpoint exista en la API
 */
export async function obtenerBorradorActivo(
  slug: string
): Promise<PaginaVersion | null> {
  // TODO: Fase 6 — descomentar:
  // const res = await apiClient.get(`/paginas/${slug}/borrador-activo`);
  // return res as PaginaVersion | null;
  void slug;
  return null;
}

// ---------------------------------------------------------------------------
// Escritura / flujo editorial
// ---------------------------------------------------------------------------

/**
 * Guarda o actualiza el borrador de una página.
 * Si ya existe un borrador, lo sobreescribe (misma versión).
 * Si no existe, crea una nueva versión con estado "borrador".
 *
 * TODO: Fase 6 — descomentar cuando el endpoint exista en la API
 */
export async function guardarBorrador(
  slug: string,
  contenido: ContenidoPagina
): Promise<{ versionId: string } | null> {
  // TODO: Fase 6 — descomentar:
  // const res = await apiClient.put(`/paginas/${slug}/versiones`, { contenido });
  // return res as { versionId: string };
  void slug;
  void contenido;
  return null;
}

/**
 * Envía la versión activa a revisión (borrador → en_revision).
 * Dispara el Domain Event EnviadoARevision en la API → alerta al Administrador.
 *
 * TODO: Fase 7 — descomentar cuando el endpoint y el Domain Event existan
 */
export async function enviarARevision(
  slug: string,
  versionId: string
): Promise<{ estado: "en_revision" } | null> {
  // TODO: Fase 7 — descomentar:
  // const res = await apiClient.post(
  //   `/paginas/${slug}/versiones/${versionId}/enviar-revision`
  // );
  // return res as { estado: "en_revision" };
  void slug;
  void versionId;
  return null;
}
