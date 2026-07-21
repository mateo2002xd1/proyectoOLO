"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const audit_usecase_1 = require("../use-cases/auditoria/audit.usecase");
exports.AuditController = {
    async getAll(req, res, next) {
        try {
            const { page, limit, contentType, userId, actionType } = req.query;
            res.json(await (0, audit_usecase_1.getAllAudit)({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 50,
                contentType,
                userId,
                actionType,
            }));
        }
        catch (err) {
            next(err);
        }
    },
    async getByContentId(req, res, next) {
        try {
            const { contentType, contentId } = req.params;
            res.json(await (0, audit_usecase_1.getAuditByContentId)(contentId, contentType));
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=auditoria.controller.js.map