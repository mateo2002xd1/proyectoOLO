"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roles_controller_1 = require("../controllers/roles.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', roles_controller_1.RoleController.getAll);
router.get('/:id', roles_controller_1.RoleController.getById);
router.post('/', roles_controller_1.RoleController.create);
router.patch('/:id', roles_controller_1.RoleController.update);
router.delete('/:id', roles_controller_1.RoleController.delete);
exports.default = router;
//# sourceMappingURL=role.routes.js.map