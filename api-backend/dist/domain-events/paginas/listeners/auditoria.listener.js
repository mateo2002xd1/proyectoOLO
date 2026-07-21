"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditoriaListener = void 0;
const auditoria_repository_1 = require("../../../repositories/auditoria.repository");
const auditoriaListener = (data) => {
    try {
        auditoria_repository_1.AuditRepository.create({
            content_id: data.contentId,
            content_type: data.contentType,
            user_id: data.userId,
            user_name: data.userName,
            action_type: data.actionType,
            modified_fields: data.modifiedFields,
        });
    }
    catch (error) {
        console.error('Error al registrar auditoría:', error);
    }
};
exports.auditoriaListener = auditoriaListener;
//# sourceMappingURL=auditoria.listener.js.map