import { ContentAuditLog } from '../infrastructure/db/models';

export const AuditRepository = {
  create: (data: any) => ContentAuditLog.create(data),

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
