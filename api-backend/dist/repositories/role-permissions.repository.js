"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissionRepository = void 0;
const models_1 = require("../infrastructure/db/models");
exports.RolePermissionRepository = {
    findAll: () => models_1.RolePermission.findAll(),
    findByRole: (role_id) => models_1.RolePermission.findAll({ where: { role_id } }),
    assign: (role_id, permission_id) => models_1.RolePermission.findOrCreate({ where: { role_id, permission_id } }),
    revoke: (role_id, permission_id) => models_1.RolePermission.destroy({ where: { role_id, permission_id } }),
    revokeAll: (role_id) => models_1.RolePermission.destroy({ where: { role_id } }),
    getPermissionsByRole: async (roleName) => {
        const role = await models_1.Role.findOne({
            where: { name: roleName },
            include: [{
                    model: models_1.Permission,
                    as: 'permissions',
                    attributes: ['name']
                }]
        });
        if (!role || !role.get('permissions'))
            return [];
        const perms = role.get('permissions');
        return perms.map(p => p.name);
    }
};
//# sourceMappingURL=role-permissions.repository.js.map