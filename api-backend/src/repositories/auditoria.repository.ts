import { Op } from 'sequelize';
import { ContentAuditLog } from '../infrastructure/db/models';
import type { AccionAuditable, EntidadAuditable } from '../infrastructure/db/models/ContentAuditLog';

/** Un campo que cambió, con su valor anterior y el nuevo (RF-07). */
export interface CampoModificado {
  campo: string;
  antes: unknown;
  despues: unknown;
}

/**
 * Lo que hace falta para registrar una entrada de bitácora.
 *
 * **Este tipo es la defensa contra el bug que dejó la auditoría a cero.** El
 * `create` recibía `any`: cuando la migración 006 renombró las columnas al
 * español y tradujo los verbos de acción, quien escribía siguió mandando
 * `content_id` y `'create'` y TypeScript no dijo nada. Con `accion` atada a
 * `AccionAuditable`, mandar `'create'` en vez de `'crear'` ya no compila.
 */
export interface DatosAuditoria {
  entidadId: string;
  entidadTipo?: EntidadAuditable;
  usuarioId?: string | null;
  usuarioNombre?: string | null;
  accion: AccionAuditable;
  camposModificados?: CampoModificado[];
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Filtros de consulta de la bitácora.
 *
 * Tipados por el mismo motivo que `DatosAuditoria`: hasta ahora `findAll` recibía
 * `any` y los nombres venían del querystring en inglés (`contentType`), heredados
 * de antes de la migración 006. Con la pantalla de RF-07 consumiéndolo, un filtro
 * mal escrito debe dejar de compilar en vez de devolver la bitácora entera.
 */
export interface FiltrosAuditoria {
  pagina?: number;
  porPagina?: number;
  entidadTipo?: EntidadAuditable;
  usuarioId?: string;
  accion?: AccionAuditable;
  /** Inclusivo. */
  desde?: Date;
  /** Inclusivo: quien filtra por un día espera que ese día entre. */
  hasta?: Date;
}

/**
 * Tope de filas por petición.
 *
 * Antes `limit` viajaba del querystring al SQL sin ningún tope, así que
 * `?limit=1000000` era una petición válida contra la tabla que más crece del
 * sistema. La exportación a CSV recorre páginas en vez de pedir una gigante.
 */
export const MAX_POR_PAGINA = 200;
const POR_PAGINA_POR_DEFECTO = 50;

export const AuditRepository = {
  /**
   * Traduce del dominio (camelCase) a las columnas del modelo (snake_case).
   *
   * La traducción vive aquí y no en quien llama para que haya un solo sitio que
   * tocar la próxima vez que una migración renombre algo.
   */
  create: (datos: DatosAuditoria) =>
    ContentAuditLog.create({
      entidad_id: datos.entidadId,
      entidad_tipo: datos.entidadTipo ?? 'contenido',
      usuario_id: datos.usuarioId ?? null,
      usuario_nombre: datos.usuarioNombre ?? null,
      accion: datos.accion,
      campos_modificados: datos.camposModificados ?? [],
      ip: datos.ip ?? null,
      user_agent: datos.userAgent ?? null,
    }),

  findByContentId: (entidadId: string, entidadTipo?: string) => {
    const where: any = { entidad_id: entidadId };
    if (entidadTipo) where.entidad_tipo = entidadTipo;
    return ContentAuditLog.findAll({ where, order: [['created_at', 'DESC']] });
  },

  findAll: async (filtros: FiltrosAuditoria = {}) => {
    const { entidadTipo, usuarioId, accion, desde, hasta } = filtros;

    const where: Record<string, unknown> = {};
    if (entidadTipo) where.entidad_tipo = entidadTipo;
    if (usuarioId) where.usuario_id = usuarioId;
    if (accion) where.accion = accion;

    // `createdAt` es el nombre del atributo; el modelo va con `underscored: true`,
    // así que Sequelize lo traduce a la columna `created_at` (la que indexa
    // `idx_auditoria_fecha`).
    if (desde || hasta) {
      where.createdAt = {
        ...(desde ? { [Op.gte]: desde } : {}),
        ...(hasta ? { [Op.lte]: hasta } : {}),
      };
    }

    const porPagina = Math.min(Math.max(filtros.porPagina || POR_PAGINA_POR_DEFECTO, 1), MAX_POR_PAGINA);
    const pagina = Math.max(filtros.pagina || 1, 1);

    const { rows, count } = await ContentAuditLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: porPagina,
      offset: (pagina - 1) * porPagina,
    });

    return {
      registros: rows,
      total: count,
      pagina,
      porPagina,
      totalPaginas: Math.max(Math.ceil(count / porPagina), 1),
    };
  },
};
