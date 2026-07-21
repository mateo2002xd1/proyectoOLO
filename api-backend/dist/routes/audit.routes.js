"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditoria_controller_1 = require("../controllers/auditoria.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', auditoria_controller_1.AuditController.getAll);
router.get('/:contentType/:contentId', auditoria_controller_1.AuditController.getByContentId);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map