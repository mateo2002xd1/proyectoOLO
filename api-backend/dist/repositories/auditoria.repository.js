"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepository = void 0;
const models_1 = require("../infrastructure/db/models");
exports.AuditRepository = {
    create: (data) => models_1.ContentAuditLog.create(data),
    findByContentId: (contentId, contentType) => {
        const where = { content_id: contentId };
        if (contentType)
            where.content_type = contentType;
        return models_1.ContentAuditLog.findAll({ where, order: [['created_at', 'DESC']] });
    },
    findAll: async ({ page = 1, limit = 50, contentType, userId, actionType } = {}) => {
        const where = {};
        if (contentType)
            where.content_type = contentType;
        if (userId)
            where.user_id = userId;
        if (actionType)
            where.action_type = actionType;
        const offset = (page - 1) * limit;
        const { rows, count } = await models_1.ContentAuditLog.findAndCountAll({
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
//# sourceMappingURL=auditoria.repository.js.map