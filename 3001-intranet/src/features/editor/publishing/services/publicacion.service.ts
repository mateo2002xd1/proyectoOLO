/**
 * Etapa de publicación: leer lo aprobado para enseñarlo a quien visita la intranet.
 *
 * Aquí no se aplica la regla 3 de `8-ciclo-editorial.md` §3.2 («publicación nunca usa
 * el cliente autenticado»): la intranet no tiene zona pública, toda sección exige
 * sesión, y `apiClient` es el único cliente que hay. Lo que sí se mantiene es que
 * esta etapa solo lee versiones aprobadas.
 *
 * Endpoints backend:
 *   GET  /paginas/publica/:slug       → la versión publicada, o 404
 *   GET  /paginas/indice-busqueda     → los textos de todas las publicadas
 *   POST /paginas/visitas/registrar   → cuenta una visita
 */

import { apiClient, ApiError } from "@/shared/lib/api/api-client";
import type { PaginaIndiceBusqueda, PaginaPublicada } from "../../model/pagina.types";

/**
 * Contenido publicado de una página, para mostrarlo a quien la visita.
 *
 * Solo devuelve la versión aprobada: un borrador o algo pendiente de revisión no
 * se ve aquí. Si la página no existe o todavía no tiene versión publicada, es
 * `null` — no es un error, es que no hay nada que mostrar.
 *
 * **Exige la sesión de quien mira**: la API ya no entrega contenido de la intranet sin
 * cuenta. En el navegador la cookie viaja sola; desde un componente de servidor hay que
 * pasar `opciones` con `cabecerasConSesion()`, o la API responde 401.
 */
export async function obtenerPaginaPublicada(
  slug: string,
  opciones?: RequestInit
): Promise<PaginaPublicada | null> {
  try {
    return await apiClient.get<PaginaPublicada>(`/paginas/publica/${slug}`, opciones);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
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

/**
 * Registra una visita en el backend de forma segura y no bloqueante.
 *
 * Es la misma petición que hace sitio-web (`registrarVisita` en su
 * `publicacion.service.ts`): `fetch` directo y con `keepalive` para que no se pierda si la
 * persona cambia de página enseguida. A diferencia del sitio, en la intranet lleva la
 * cookie de sesión (mismo origen): la API no cuenta visitas de la intranet sin cuenta.
 */
export async function registrarVisita(slug: string, ambito: 'sitio' | 'intranet' = 'intranet'): Promise<void> {
  try {
    // Por el proxy `/api-backend` (añade el `/api`), como `api-client.ts`: con una URL
    // absoluta, fuera del equipo del servidor el navegador acababa en su propio localhost.
    await fetch('/api-backend/paginas/visitas/registrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ambito': ambito,
      },
      body: JSON.stringify({ slug, ambito }),
      credentials: 'same-origin',
      keepalive: true,
    });
  } catch {
    // Falla silenciosamente para no alterar la experiencia del usuario
  }
}
