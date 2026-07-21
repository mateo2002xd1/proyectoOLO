"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permisos_controller_1 = require("../controllers/permisos.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', permisos_controller_1.PermissionController.getAll);
router.get('/:id', permisos_controller_1.PermissionController.getById);
router.post('/', permisos_controller_1.PermissionController.create);
router.patch('/:id', permisos_controller_1.PermissionController.update);
router.delete('/:id', permisos_controller_1.PermissionController.delete);
exports.default = router;
//# sourceMappingURL=permission.routes.js.map