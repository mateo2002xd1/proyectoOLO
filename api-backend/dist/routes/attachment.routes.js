"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adjuntos_controller_1 = require("../controllers/adjuntos.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_middleware_1.requireAuth);
router.get('/', adjuntos_controller_1.AttachmentController.getByPost);
router.post('/', adjuntos_controller_1.AttachmentController.create);
exports.default = router;
//# sourceMappingURL=attachment.routes.js.map