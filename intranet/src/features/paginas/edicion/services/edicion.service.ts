/**
 * Etapa de edición: lo que pide el editor a la API :4000 vía el proxy /api-backend.
 *
 * Endpoints backend (unificados con sitio-web, almacenamiento en DB):
 *   GET    /paginas/:slug/editable        → última versión editable (o vacío)
 *   POST   /paginas/:slug/borrador        → guarda una nueva versión borrador
 *   PATCH  /paginas/:slug/enviar-revision → borrador → en_revision
 *   POST   /paginas/:slug/bloqueo         → pide o renueva el candado de edición
 *   DELETE /paginas/:slug/bloqueo         → lo suelta
 *   POST   /paginas/:slug/subidas         → anota una subida pendiente
 *
 * Leer lo publicado está en `publicacion/services/publicacion.service.ts`, y crear o
 * borrar secciones en `secciones/services/secciones.service.ts`.
 *
 * @see 1-guia-del-proyecto.md §4.1 (use-cases/paginas/)
 * @see 3-seguridad-del-proyecto.md §S3  (API :4000 es la única fuente de JWT/auth)
 */

import { apiClient, ApiError } from "@/shared/lib/api-client";
import type { ContenidoPagina, EstadoPagina, VersionEditable } from "../../model/pagina.types";

const EMPTY_CONTENIDO: ContenidoPagina = { content: [], root: {} };

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
    numeroVersion: res.numeroVersion ?? null,
    motivoRechazo: res.motivoRechazo ?? null,
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

/**
 * Anota que `ruta` se subió para esta página, para que al publicarla se borre si
 * ninguna versión la usa. Si falla, la subida sigue sirviendo igual.
 */
export async function registrarSubidaPendiente(slug: string, ruta: string): Promise<void> {
  await apiClient.post(`/paginas/${slug}/subidas`, { ruta }).catch(() => undefined);
}
