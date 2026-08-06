import type { FiltrosAuditoria, RespuestaAuditoria } from '../types';

/** Necesario para que el navegador mande la cookie de sesión al proxy de Next. */
const FETCH_OPTS: RequestInit = { credentials: 'include' };

/** Tope del backend (`MAX_POR_PAGINA`). Pedir más no devuelve más. */
export const MAX_POR_PAGINA = 200;

const conFiltros = (filtros: Partial<FiltrosAuditoria>, pagina: number, porPagina: number) => {
  const params = new URLSearchParams({ pagina: String(pagina), porPagina: String(porPagina) });

  // Un filtro vacío no se manda: mandarlo como cadena vacía haría que el backend
  // lo descartara igual, pero deja una URL ilegible en el registro del servidor.
  if (filtros.usuarioId) params.set('usuarioId', filtros.usuarioId);
  if (filtros.accion) params.set('accion', filtros.accion);
  if (filtros.entidadTipo) params.set('entidadTipo', filtros.entidadTipo);
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);

  return params;
};

export async function listarAuditoria(
  filtros: Partial<FiltrosAuditoria>,
  pagina = 1,
  porPagina = 50,
): Promise<RespuestaAuditoria> {
  const res = await fetch(`/api/audit-logs?${conFiltros(filtros, pagina, porPagina)}`, FETCH_OPTS);

  if (res.status === 403) {
    throw new Error('Tu rol no tiene acceso a la bitácora de auditoría.');
  }
  if (!res.ok) {
    throw new Error('No se pudo cargar la bitácora de auditoría.');
  }

  return res.json();
}

export type UsuarioDeFiltro = { id: string; nombre: string };

/**
 * Personas para el desplegable del filtro.
 *
 * Sale de `/api/users` —el proxy que ya existe— y no del hook de administración:
 * un desplegable no justifica arrastrar todo el CRUD de usuarios a esta feature.
 * Si falla, se devuelve vacío: quedarse sin ese filtro no debe impedir leer la
 * bitácora.
 */
export async function listarUsuariosDeFiltro(): Promise<UsuarioDeFiltro[]> {
  try {
    const res = await fetch('/api/users', FETCH_OPTS);
    if (!res.ok) return [];

    const usuarios = await res.json();
    if (!Array.isArray(usuarios)) return [];

    return usuarios
      .map((u: { id: string; name?: string; email?: string }) => ({
        id: u.id,
        nombre: u.name || u.email || u.id,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  } catch {
    return [];
  }
}
