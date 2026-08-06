import type { AccionAuditable, EntidadAuditable } from '../infrastructure/db/models/ContentAuditLog';
import type { CampoModificado, FiltrosAuditoria } from '../repositories/auditoria.repository';

/**
 * Lo que la API entrega de una entrada de bitácora.
 *
 * La tabla guarda las columnas en snake_case; el resto de la API habla camelCase
 * (`PaginaEnRevision.numeroVersion`). La traducción se hace ahora porque la
 * pantalla de RF-07 es el **primer** consumidor de `/api/audit-logs`: no hay
 * ningún contrato anterior que respetar, y era la última oportunidad de hacerlo
 * sin romper a nadie.
 */
export interface RegistroAuditoria {
  id: string;
  entidadId: string;
  entidadTipo: EntidadAuditable;
  usuarioId: string | null;
  usuarioNombre: string | null;
  accion: AccionAuditable;
  camposModificados: CampoModificado[];
  ip: string | null;
  userAgent: string | null;
  fecha: string;
}

/** Fila de Sequelize (o su `toJSON`), que puede traer la fecha en cualquiera de las dos formas. */
type FilaAuditoria = {
  id: string;
  entidad_id: string;
  entidad_tipo: EntidadAuditable;
  usuario_id: string | null;
  usuario_nombre: string | null;
  accion: AccionAuditable;
  campos_modificados: CampoModificado[] | null;
  ip: string | null;
  user_agent: string | null;
  createdAt?: Date | string;
  created_at?: Date | string;
};

export const aRegistroAuditoria = (fila: FilaAuditoria): RegistroAuditoria => {
  const fecha = fila.createdAt ?? fila.created_at;

  return {
    id: fila.id,
    entidadId: fila.entidad_id,
    entidadTipo: fila.entidad_tipo,
    usuarioId: fila.usuario_id ?? null,
    usuarioNombre: fila.usuario_nombre ?? null,
    accion: fila.accion,
    camposModificados: fila.campos_modificados ?? [],
    ip: fila.ip ?? null,
    userAgent: fila.user_agent ?? null,
    fecha: fecha instanceof Date ? fecha.toISOString() : String(fecha ?? ''),
  };
};

const ENTIDADES: EntidadAuditable[] = [
  'contenido', 'pagina', 'seccion', 'usuario', 'rol', 'marca', 'configuracion', 'archivo',
];

const ACCIONES: AccionAuditable[] = [
  'crear', 'actualizar', 'eliminar', 'publicar', 'despublicar', 'aprobar', 'rechazar', 'enviar_revision',
];

const comoTexto = (valor: unknown) => (typeof valor === 'string' && valor.trim() ? valor.trim() : undefined);

const comoEntero = (valor: unknown) => {
  const n = Number.parseInt(String(valor ?? ''), 10);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Una fecha inválida **se ignora en vez de romper la petición**, pero tampoco se
 * cuela como filtro: `new Date('cualquier cosa')` es `Invalid Date`, y pasársela a
 * Sequelize genera SQL con `NaN` dentro.
 */
const comoFecha = (valor: unknown, finDelDia = false) => {
  const texto = comoTexto(valor);
  if (!texto) return undefined;

  // Una fecha suelta (`2026-08-04`) se interpreta como el día completo: quien
  // filtra "hasta el 4" espera que el día 4 entre entero, no que corte a las 00:00.
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(texto);
  const fecha = new Date(soloFecha && finDelDia ? `${texto}T23:59:59.999` : texto);

  return Number.isNaN(fecha.getTime()) ? undefined : fecha;
};

const dentroDe = <T extends string>(valores: T[], valor: unknown): T | undefined => {
  const texto = comoTexto(valor);
  return texto && (valores as string[]).includes(texto) ? (texto as T) : undefined;
};

/**
 * Traduce el querystring a filtros del repositorio.
 *
 * Lo que no encaje se descarta en silencio: un filtro desconocido no debe
 * convertirse en "sin filtro" *ni* en un 500 — debe comportarse como si no se
 * hubiera pedido.
 */
export const filtrosDesdeQuery = (query: Record<string, unknown>): FiltrosAuditoria => ({
  pagina: comoEntero(query.pagina ?? query.page),
  porPagina: comoEntero(query.porPagina ?? query.limit),
  entidadTipo: dentroDe(ENTIDADES, query.entidadTipo ?? query.contentType),
  usuarioId: comoTexto(query.usuarioId ?? query.userId),
  accion: dentroDe(ACCIONES, query.accion ?? query.actionType),
  desde: comoFecha(query.desde),
  hasta: comoFecha(query.hasta, true),
});
