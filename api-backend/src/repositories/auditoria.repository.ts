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

  findAll: async ({ page = 1, limit = 50, contentType, userId, actionType }: any = {}) => {
    const where: any = {};
    if (contentType) where.entidad_tipo = contentType;
    if (userId) where.usuario_id = userId;
    if (actionType) where.accion = actionType;

    const offset = (page - 1) * limit;
    const { rows, count } = await ContentAuditLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      logs: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  },
};
