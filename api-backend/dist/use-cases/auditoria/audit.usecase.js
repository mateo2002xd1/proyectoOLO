"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAudit = exports.getAuditByContentId = exports.logAudit = void 0;
const auditoria_repository_1 = require("../../repositories/auditoria.repository");
const logAudit = (data) => {
    auditoria_repository_1.AuditRepository.create({
        content_id: data.contentId,
        content_type: data.contentType || 'post',
        user_id: data.userId || null,
        user_name: data.userName || null,
        action_type: data.actionType,
        modified_fields: data.modifiedFields || [],
        created_at: new Date(),
    });
};
exports.logAudit = logAudit;
const getAuditByContentId = (contentId, contentType) => auditoria_repository_1.AuditRepository.findByContentId(contentId, contentType);
exports.getAuditByContentId = getAuditByContentId;
const getAllAudit = (params) => auditoria_repository_1.AuditRepository.findAll(params);
exports.getAllAudit = getAllAudit;
//# sourceMappingURL=audit.usecase.js.map