"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_permissions_controller_1 = require("../controllers/role-permissions.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', role_permissions_controller_1.RolePermissionController.getAll);
router.get('/role/:roleId', role_permissions_controller_1.RolePermissionController.getByRole);
router.post('/', role_permissions_controller_1.RolePermissionController.assign);
router.delete('/', role_permissions_controller_1.RolePermissionController.revoke);
exports.default = router;
//# sourceMappingURL=rolePermission.routes.js.map