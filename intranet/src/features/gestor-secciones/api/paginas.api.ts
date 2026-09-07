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
  paginaId?: string;
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
  opciones?: RequestInit,
  versionId?: string
): Promise<VersionEditable> {
  const query = versionId ? `?versionId=${encodeURIComponent(versionId)}` : '';
  const res = await apiClient.get<Partial<VersionEditable>>(`/paginas/${slug}/editable${query}`, opciones);
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

/** Lo que responde la API al pedir el candado de edición. */
export interface EstadoDelBloqueo {
  /** `true` si el candado quedó a nombre de quien lo pidió. */
  propio: boolean;
  /** Solo cuando no es propio: quién lo tiene abierto. */
  bloqueadoPor: { nombre: string } | null;
  /** Si a esta persona le sale «Entrar de todos modos». */
  puedeForzar: boolean;
}

/**
 * Pide o renueva el candado de edición de una sección.
 *
 * El 409 —«lo tiene otra persona»— no es un fallo que haya que propagar: es una de
 * las dos respuestas normales, y trae dentro el nombre de quien está editando, que
 * es justo lo que hay que enseñar. Por eso se traduce a un objeto y no a una
 * excepción. Cualquier otro error sí sube, porque ahí sí pasa algo raro.
 */
export async function adquirirBloqueo(
  slug: string,
  forzar = false
): Promise<EstadoDelBloqueo> {
  try {
    return await apiClient.post<EstadoDelBloqueo>(`/paginas/${slug}/bloqueo`, { forzar });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      const cuerpo = (error.body ?? {}) as Partial<EstadoDelBloqueo>;
      return {
        propio: false,
        bloqueadoPor: cuerpo.bloqueadoPor ?? { nombre: "Otra persona" },
        puedeForzar: cuerpo.puedeForzar === true,
      };
    }
    throw error;
  }
}

/**
 * Suelta el candado. No falla si ya no era suyo.
 *
 * `keepalive` es lo que permite que la petición sobreviva a la pestaña que la lanzó:
 * esto se llama también desde `pagehide`, y sin esa marca el navegador cancelaría el
 * DELETE al cerrar y la sección se quedaría bloqueada hasta que caducara sola.
 * `sendBeacon` no sirve aquí porque solo sabe hacer POST.
 */
export async function liberarBloqueo(slug: string): Promise<void> {
  await apiClient
    .delete(`/paginas/${slug}/bloqueo`, { keepalive: true })
    .catch(() => undefined);
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
  motivo: "tiene-enlaces" | null;
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

export interface ItemTextoBusqueda {
  type: 'h1' | 'h2' | 'p' | 'span';
  text: string;
  blockId?: string;
}

export interface PaginaIndiceBusqueda {
  href: string;
  slug: string;
  titulo: string;
  items: ItemTextoBusqueda[];
}

/**
 * Obtiene el índice de búsqueda dinámico con los textos de todas las páginas publicadas.
 */
export async function obtenerIndiceBusqueda(): Promise<PaginaIndiceBusqueda[]> {
  try {
    return await apiClient.get<PaginaIndiceBusqueda[]>('/paginas/indice-busqueda');
  } catch (error) {
    console.error('Error al obtener índice dinámico de búsqueda:', error);
    return [];
  }
}

