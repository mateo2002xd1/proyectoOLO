/**
 * API client del módulo de páginas — consume la API :4000 vía el proxy /api-backend.
 *
 * Endpoints backend (unificados con sitio-web, almacenamiento en DB):
 *   GET   /paginas/:slug/editable        → última versión editable (o vacío)
 *   POST  /paginas/:slug/borrador        → guarda una nueva versión borrador
 *   PATCH /paginas/:slug/enviar-revision → borrador → en_revision
 *
 * @see 1-guia-del-proyecto.md §4.1 (use-cases/paginas/)
 * @see 3-seguridad-del-proyecto.md §S3  (API :4000 es la única fuente de JWT/auth)
 */

import { apiClient, ApiError } from "@/shared/lib/api-client";
import type { ContenidoPagina, EstadoPagina } from "../types/editor.types";

const EMPTY_CONTENIDO: ContenidoPagina = { content: [], root: {} };

export interface PaginaPublicada {
  slug: string;
  titulo: string;
  contenido: ContenidoPagina;
}

/**
 * Contenido publicado de una página, para mostrarlo a quien la visita.
 *
 * Solo devuelve la versión aprobada: un borrador o algo pendiente de revisión no
 * se ve aquí. Si la página no existe o todavía no tiene versión publicada, es
 * `null` — no es un error, es que no hay nada que mostrar.
 */
export async function obtenerPaginaPublicada(slug: string): Promise<PaginaPublicada | null> {
  try {
    return await apiClient.get<PaginaPublicada>(`/paginas/publica/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export interface VersionEditable {
  slug: string;
  titulo: string;
  contenido: ContenidoPagina;
  estado: EstadoPagina | null;
  versionId: string | null;
}

/**
 * Obtiene el contenido editable de una página (última versión, cualquier estado).
 * Si la página aún no existe, el backend devuelve contenido vacío (no 404).
 */
export async function obtenerVersionEditable(
  slug: string,
  opciones?: RequestInit
): Promise<VersionEditable> {
  const res = await apiClient.get<Partial<VersionEditable>>(`/paginas/${slug}/editable`, opciones);
  return {
    slug: res.slug ?? slug,
    titulo: res.titulo ?? slug,
    contenido: res.contenido ?? EMPTY_CONTENIDO,
    estado: res.estado ?? null,
    versionId: res.versionId ?? null,
  };
}

/**
 * Guarda el layout de Puck como una nueva versión borrador.
 * El backend auto-crea la página si el slug no existe.
 */
export async function guardarBorrador(
  slug: string,
  contenido: ContenidoPagina
): Promise<{ versionId: string; estado: EstadoPagina } | null> {
  const res = await apiClient.post<{ version?: { id: string; estado: EstadoPagina } }>(
    `/paginas/${slug}/borrador`,
    { contenido }
  );
  if (!res?.version?.id) return null;
  return { versionId: res.version.id, estado: res.version.estado };
}

/**
 * Envía la versión borrador activa a revisión (borrador → en_revision).
 */
export async function enviarARevision(
  slug: string,
  _versionId?: string
): Promise<{ estado: EstadoPagina } | null> {
  const res = await apiClient.patch<{ version?: { estado: EstadoPagina } }>(
    `/paginas/${slug}/enviar-revision`
  );
  if (!res?.version?.estado) return null;
  return { estado: res.version.estado };
}
