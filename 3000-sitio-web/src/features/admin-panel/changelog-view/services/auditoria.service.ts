import type { FiltrosAuditoria, RespuestaAuditoria } from '../types';
import { alLoginPorSesionExpirada } from '@/shared/lib/api-client';
import { MENSAJE_SIN_RESPUESTA } from '@/shared/lib/errores-api';

/** El proxy de Next responde 502 cuando no llega a la API; 503 y 504, un intermedio. */
const SIN_RESPUESTA_DE_LA_API = new Set([502, 503, 504]);

/** Necesario para que el navegador mande la cookie de sesión al proxy de Next. */
const FETCH_OPTS: RequestInit = { credentials: 'include' };

/** Tope del backend (`MAX_POR_PAGINA`). Pedir más no devuelve más. */
export const MAX_POR_PAGINA = 200;

/**
 * Fallo al leer la bitácora. `sinAcceso` marca el 403 por rol —que no es una
 * avería sino la política de `auditoria.policies.ts`— para que quien la muestre
 * de forma secundaria (el panel general) lo trate como una sección vedada y no
 * como un error del sistema.
 */
export class ErrorAuditoria extends Error {
  readonly sinAcceso: boolean;

  constructor(mensaje: string, sinAcceso = false) {
    super(mensaje);
    this.name = 'ErrorAuditoria';
    this.sinAcceso = sinAcceso;
  }
}

const conFiltros = (filtros: Partial<FiltrosAuditoria>, pagina: number, porPagina: number) => {
  const params = new URLSearchParams({ pagina: String(pagina), porPagina: String(porPagina) });

  // Un filtro vacío no se manda: mandarlo como cadena vacía haría que el backend
  // lo descartara igual, pero deja una URL ilegible en el registro del servidor.
  if (filtros.usuarioId) params.set('usuarioId', filtros.usuarioId);
  // `accion` ya viaja como lista separada por comas cuando la etiqueta agrupa verbos.
  if (filtros.accion) params.set('accion', filtros.accion);
  // La API la combina con `accion` con «y»: es lo que separa «Editado» de «Modificado».
  if (filtros.categoria) params.set('categoria', filtros.categoria);
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);

  return params;
};

export async function listarAuditoria(
  filtros: Partial<FiltrosAuditoria>,
  pagina = 1,
  porPagina = 50,
): Promise<RespuestaAuditoria> {
  let res: Response;
  try {
    res = await fetch(`/api/audit-logs?${conFiltros(filtros, pagina, porPagina)}`, FETCH_OPTS);
  } catch {
    throw new ErrorAuditoria(MENSAJE_SIN_RESPUESTA);
  }

  // 401 antes que 403: son cosas distintas y se resuelven distinto. «No sé quién eres»
  // se arregla volviendo a entrar, y de eso se encarga el cliente común; «no te toca»
  // no se arregla entrando otra vez, así que se queda en pantalla y se explica.
  // Sin esta rama, una sesión caducada dejaba la bitácora vacía sin decir por qué.
  if (res.status === 401) {
    alLoginPorSesionExpirada();
    throw new ErrorAuditoria('Tu sesión expiró. Te llevamos al inicio de sesión.');
  }
  if (res.status === 403) {
    throw new ErrorAuditoria('Tu rol no tiene acceso a la bitácora de auditoría.', true);
  }
  // Con la API caída se dice eso, y no un «no se pudo» que no explica nada (pedido del
  // usuario, 2026-10-15). El título del aviso ya dice qué no cargó.
  if (SIN_RESPUESTA_DE_LA_API.has(res.status)) {
    throw new ErrorAuditoria(MENSAJE_SIN_RESPUESTA);
  }
  if (!res.ok) {
    // Si la API explicó el fallo, se dice eso; si no, uno genérico.
    const cuerpo = await res.json().catch(() => null);
    const mensaje = typeof cuerpo?.error === 'string' && cuerpo.error.trim() ? cuerpo.error : null;
    throw new ErrorAuditoria(mensaje ?? 'El servidor respondió con un error inesperado.');
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
      .map((u: { id: string; name?: string; apellidos?: string; email?: string }) => ({
        id: u.id,
        nombre: [u.name, u.apellidos].filter(Boolean).join(' ') || u.email || u.id,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  } catch {
    return [];
  }
}

export interface AnalisisDepuracionAuditoriaDTO {
  /** Registros con más de un año: los que se depuran. */
  totalEncontrados: number;
  /** Un año antes de hoy: lo anterior se puede depurar. */
  fechaCorte: string;
  /** Lo que ocupan los registros de más de un año. */
  pesoEstimadoBytes: number;
  /** Registros del último año, que se conservan, y lo que ocupan. */
  totalUltimoAnio: number;
  pesoUltimoAnioBytes: number;
  pesoTablaBytes: number;
  registros: import('../types').RegistroAuditoria[];
}


export interface ResultadoDepuracionAuditoriaDTO {
  eliminadas: number;
  bytesLiberados: number;
  pesoTablaAntes: number;
  pesoTablaDespues: number;
}

export async function analizarDepuracionAuditoria(): Promise<AnalisisDepuracionAuditoriaDTO> {
  const res = await fetch('/api/audit-logs/depurar/analizar', FETCH_OPTS);
  if (res.status === 401) {
    alLoginPorSesionExpirada();
    throw new ErrorAuditoria('Tu sesión expiró. Te llevamos al inicio de sesión.');
  }
  if (res.status === 403) {
    throw new ErrorAuditoria('Tu rol no tiene acceso para depurar la bitácora.', true);
  }
  if (!res.ok) {
    throw new ErrorAuditoria('No se pudo analizar la depuración de auditoría.');
  }
  return res.json();
}

export async function ejecutarDepuracionAuditoria(ids: string[]): Promise<ResultadoDepuracionAuditoriaDTO> {
  const res = await fetch('/api/audit-logs/depurar', {
    ...FETCH_OPTS,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  if (res.status === 401) {
    alLoginPorSesionExpirada();
    throw new ErrorAuditoria('Tu sesión expiró. Te llevamos al inicio de sesión.');
  }
  if (res.status === 403) {
    throw new ErrorAuditoria('Tu rol no tiene acceso para depurar la bitácora.', true);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ErrorAuditoria(data.error || 'No se pudo completar la depuración de auditoría.');
  }
  return res.json();
}

