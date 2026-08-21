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

export interface SeccionCreada {
  id: string;
  slug: string;
  titulo: string;
  ambito: "sitio" | "intranet";
  /** La ruta lista para pegar en el menú, con la barra delante. */
  ruta: string;
  clavePermiso: string;
  /** El rol que recibió el permiso de editarla, o `null` si era superadmin. */
  rolConcedido: string | null;
}

/**
 * Crea una sección nueva.
 *
 * Solo manda el nombre: **la ruta la decide el servidor** con `@olo/slug-policy`. El
 * diálogo enseña una vista previa calculada con ese mismo paquete, así que coinciden,
 * pero mandar el slug desde aquí sería dejar que el navegador eligiera la clave de
 * permiso que se va a crear.
 *
 * La sección nace sin versión publicada: su ruta existe pero todavía no muestra nada
 * hasta que se llene y alguien la apruebe.
 */
export async function crearSeccion(titulo: string): Promise<SeccionCreada> {
  return apiClient.post<SeccionCreada>("/paginas", { titulo });
}

/** Un sitio del portal que enlaza a la sección que se quiere borrar. */
export interface ReferenciaAEnlace {
  slug: string;
  titulo: string;
  texto: string | null;
}

export interface AnalisisDeEliminacion {
  id: string;
  slug: string;
  titulo: string;
  ambito: "sitio" | "intranet";
  puedeEliminarse: boolean;
  motivo: "de-fabrica" | "tiene-enlaces" | null;
  versiones: number;
  publicada: boolean;
  referencias: ReferenciaAEnlace[];
}

/**
 * Qué pasaría al borrar esta sección, sin borrar nada.
 *
 * Lo pide el diálogo al abrirse: cuántas versiones se pierden, si la ruta está viva y
 * —lo que de verdad decide— qué enlaces del portal apuntan ahí. El servidor lo vuelve
 * a calcular al borrar, así que esto es para informar, no para autorizar.
 */
export async function analizarEliminacion(slug: string): Promise<AnalisisDeEliminacion> {
  return apiClient.get<AnalisisDeEliminacion>(`/paginas/${slug}/eliminable`);
}

export interface SeccionEliminada {
  id: string;
  slug: string;
  titulo: string;
  versionesEliminadas: number;
  clavePermiso: string;
  rolesAfectados: string[];
}

/**
 * Borra la sección. No se deshace.
 *
 * `confirmacion` es el título tecleado a mano; el servidor lo compara con el que tiene
 * guardado y rechaza la petición si no coincide.
 */
export async function eliminarSeccion(
  slug: string,
  confirmacion: string
): Promise<SeccionEliminada> {
  return apiClient.delete<SeccionEliminada>(`/paginas/${slug}`, {
    body: JSON.stringify({ confirmacion }),
  });
}
