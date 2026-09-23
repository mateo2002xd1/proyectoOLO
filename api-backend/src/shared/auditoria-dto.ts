import type { AccionAuditable, EntidadAuditable } from '../infrastructure/db/models/content-audit-log';
import type { CampoModificado, FiltrosAuditoria } from '../repositories/auditoria.repository';
import { categoriaDe, CATEGORIAS, type CategoriaAuditoria } from './auditoria-categorias';
import { emailEnLaFila, resumenDeRegistro } from './auditoria-resumen';

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
  /**
   * La categoría de la pantalla a la que pertenece la fila, o `null` si no encaja en
   * ninguna. Va calculada aquí para que la pantalla no repita la regla: la misma que
   * usa el filtro `categoria` decide qué etiqueta lleva cada fila.
   */
  categoria: CategoriaAuditoria | null;
  camposModificados: CampoModificado[];
  /**
   * Lo que pasó, en una frase. **Siempre viene**: cada acción tiene sus frases propias
   * y lo que ninguna sabe contar lo redacta una genérica que nombra los campos en
   * español, con su antes y su después. La pantalla lo enseña tal cual en la columna
   * «Cambios». La regla vive en `auditoria-resumen.ts`.
   */
  resumen: string;
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

/**
 * Lo que la fila no sabe de sí misma.
 *
 * `entidad_id` guarda el id del usuario sobre el que se actuó, no su correo; para que
 * la frase diga «se inactivó el usuario fallip@sena.edu.co» hay que resolverlo, y eso
 * es una consulta. El controlador la hace **una vez por página** y deja aquí el
 * resultado, en vez de una consulta por fila.
 */
export interface ContextoDeLectura {
  /** Correo por id de usuario, para las filas de `entidad_tipo: usuario`. */
  emailPorUsuario?: Map<string, string>;
  /** Ids de los guardados que el editor hizo solo antes de enviar a revisión. */
  guardadosAutomaticos?: Set<string>;
  /** Nombre de cada rol por su id: para decir «rol «Editor»» y no un UUID. */
  rolPorId?: Map<string, string>;
}

export const aRegistroAuditoria = (
  fila: FilaAuditoria,
  contexto: ContextoDeLectura = {}
): RegistroAuditoria => {
  const fecha = fila.createdAt ?? fila.created_at;
  const camposModificados = fila.campos_modificados ?? [];

  return {
    id: fila.id,
    entidadId: fila.entidad_id,
    entidadTipo: fila.entidad_tipo,
    usuarioId: fila.usuario_id ?? null,
    usuarioNombre: fila.usuario_nombre ?? null,
    accion: fila.accion,
    categoria: categoriaDe(fila.accion, fila.entidad_tipo),
    camposModificados,
    resumen: resumenDeRegistro({
      accion: fila.accion,
      entidadTipo: fila.entidad_tipo,
      entidadId: fila.entidad_id,
      camposModificados,
      nombreDeRol: (id) => (typeof id === 'string' ? contexto.rolPorId?.get(id) ?? null : null),
      emailAfectado:
        contexto.emailPorUsuario?.get(fila.entidad_id) ?? emailEnLaFila(camposModificados),
      guardadoAutomatico: contexto.guardadosAutomaticos?.has(fila.id) ?? false,
    }),
    ip: fila.ip ?? null,
    userAgent: fila.user_agent ?? null,
    fecha: fecha instanceof Date ? fecha.toISOString() : String(fecha ?? ''),
  };
};

const ENTIDADES: EntidadAuditable[] = [
  'contenido', 'pagina', 'seccion', 'usuario', 'rol', 'marca', 'configuracion', 'archivo',
];

const ACCIONES: AccionAuditable[] = [
  'crear', 'actualizar', 'eliminar', 'publicar', 'despublicar', 'aprobar', 'rechazar', 'enviar_revision', 'guardar_borrador',
  'cambiar_password', 'autenticar', 'expirar', 'inactivar', 'bloquear', 'verificar_preguntas',
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

/**
 * Uno o varios valores separados por coma (`?accion=crear,eliminar`), cada uno
 * comprobado contra la lista de los que existen.
 *
 * Varios porque una etiqueta de la pantalla puede agrupar verbos de la base — ver
 * `FiltrosAuditoria`. Con uno solo devuelve el valor suelto, no una lista de uno:
 * así la consulta sigue siendo `= valor` y no `IN (valor)` para el caso de siempre.
 *
 * Lo que no esté en la lista se descarta sin más, igual que antes con un valor suelto.
 * Si no queda ninguno válido, se comporta como si no se hubiera pedido el filtro.
 */
const dentroDe = <T extends string>(valores: T[], valor: unknown): T | T[] | undefined => {
  const texto = comoTexto(valor);
  if (!texto) return undefined;

  const validos = texto
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is T => (valores as string[]).includes(item));

  if (validos.length === 0) return undefined;
  return validos.length === 1 ? validos[0] : validos;
};

const comoCategoria = (valor: unknown) => CATEGORIAS.find((categoria) => categoria === comoTexto(valor));

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
  categoria: comoCategoria(query.categoria),
  desde: comoFecha(query.desde),
  hasta: comoFecha(query.hasta, true),
});
