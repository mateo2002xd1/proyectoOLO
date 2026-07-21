"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissionController = void 0;
const role_permissions_usecase_1 = require("../use-cases/usuarios/role-permissions.usecase");
exports.RolePermissionController = {
    async getAll(_req, res, next) {
        try {
            res.json(await (0, role_permissions_usecase_1.getAllRolePermissions)());
        }
        catch (err) {
            next(err);
        }
    },
    async getByRole(req, res, next) {
        try {
            res.json(await (0, role_permissions_usecase_1.getByRole)(req.params.roleId));
        }
        catch (err) {
            next(err);
        }
    },
    async assign(req, res, next) {
        try {
            const { role_id, permission_id } = req.body;
            const result = await (0, role_permissions_usecase_1.assignPermission)(role_id, permission_id);
            res.status(result.created ? 201 : 200).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async revoke(req, res, next) {
        try {
            const role_id = req.body?.role_id || req.query?.role_id;
            const permission_id = req.body?.permission_id || req.query?.permission_id;
            if (!role_id || !permission_id)
                return res.status(400).json({ error: 'role_id y permission_id son requeridos' });
            res.json(await (0, role_permissions_usecase_1.revokePermission)(role_id, permission_id));
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=role-permissions.controller.js.map