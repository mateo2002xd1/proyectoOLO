/**
 * Llamadas de la etapa de revisión: la cola, aprobar, rechazar y descartar versiones.
 *
 * Etapas 3 a 5 del ciclo editorial (`8-ciclo-editorial.md` §3.2). Van con sesión, nunca
 * se cachean, y cada una avisa a la pestaña de que la cola cambió.
 */
import { apiConSesion as api } from '../../model/api-con-sesion';
import { notificarRevisionActualizada } from '../../model/eventos';
import type { Pagina, PaginaVersion, PaginaEnRevision, Ambito } from '../../model/pagina.types';

/**
 * Al aprobar o rechazar hay que decir sobre qué aplicación se actúa: el mismo slug
 * existe en el sitio y en la intranet, y esta cola reúne las dos. Sin este ámbito
 * explícito se aprobaría siempre la del sitio.
 */
const cabeceraDeAmbito = (ambito: Ambito) => ({ headers: { 'X-Ambito': ambito } });

export async function aprobarPagina(
  slug: string,
  ambito: Ambito = 'sitio'
): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.patch(`/api/paginas/${slug}/aprobar`, undefined, cabeceraDeAmbito(ambito));
  notificarRevisionActualizada({ slug });
  return data;
}

export async function rechazarPagina(
  slug: string,
  motivo: string,
  ambito: Ambito = 'sitio'
): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.patch(
    `/api/paginas/${slug}/rechazar`,
    { motivo },
    cabeceraDeAmbito(ambito)
  );
  notificarRevisionActualizada({ slug });
  return data;
}

/**
 * Descarta una versión sin publicar. Si era la única de la página, la página se
 * elimina con ella y la siguiente edición vuelve a empezar por la versión 1.
 */
export async function eliminarVersion(
  slug: string,
  versionId: string,
  motivo: string | null,
  ambito: Ambito = 'sitio'
): Promise<{ paginaEliminada: boolean; versionesRestantes: number }> {
  const { data } = await api.delete(
    `/api/paginas/${slug}/versiones/${versionId}`,
    { data: { motivo }, ...cabeceraDeAmbito(ambito) }
  );
  notificarRevisionActualizada({ slug, id: versionId });
  return data;
}

export async function listarEnRevision(): Promise<PaginaEnRevision[]> {
  const { data } = await api.get('/api/paginas/en-revision');
  return data;
}
