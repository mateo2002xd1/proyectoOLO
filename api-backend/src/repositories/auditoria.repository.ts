import { ContentAuditLog } from '../infrastructure/db/models';

export const AuditRepository = {
  create: (data: any) => ContentAuditLog.create(data),

  findByContentId: (contentId: string, contentType?: string) => {
    const where: any = { content_id: contentId };
    if (contentType) where.content_type = contentType;
    return ContentAuditLog.findAll({ where, order: [['created_at', 'DESC']] });
  },

  findAll: async ({ page = 1, limit = 50, contentType, userId, actionType }: any = {}) => {
    const where: any = {};
    if (contentType) where.content_type = contentType;
    if (userId) where.user_id = userId;
    if (actionType) where.action_type = actionType;

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
