"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokePermission = exports.assignPermission = exports.getByRole = exports.getAllRolePermissions = void 0;
const role_permissions_repository_1 = require("../../repositories/role-permissions.repository");
const roles_repository_1 = require("../../repositories/roles.repository");
const permisos_repository_1 = require("../../repositories/permisos.repository");
const getAllRolePermissions = () => role_permissions_repository_1.RolePermissionRepository.findAll();
exports.getAllRolePermissions = getAllRolePermissions;
const getByRole = async (roleId) => {
    const role = await roles_repository_1.RoleRepository.findById(roleId);
    if (!role)
        throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
    return role_permissions_repository_1.RolePermissionRepository.findByRole(roleId);
};
exports.getByRole = getByRole;
const assignPermission = async (role_id, permission_id) => {
    const role = await roles_repository_1.RoleRepository.findById(role_id);
    if (!role)
        throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
    const perm = await permisos_repository_1.PermissionRepository.findById(permission_id);
    if (!perm)
        throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });
    const [record, created] = await role_permissions_repository_1.RolePermissionRepository.assign(role_id, permission_id);
    return { record, created };
};
exports.assignPermission = assignPermission;
const revokePermission = async (role_id, permission_id) => {
    const deleted = await role_permissions_repository_1.RolePermissionRepository.revoke(role_id, permission_id);
    if (!deleted)
        throw Object.assign(new Error('Asignación no encontrada'), { status: 404 });
    return { message: 'Permiso revocado' };
};
exports.revokePermission = revokePermission;
//# sourceMappingURL=role-permissions.usecase.js.map