"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermission = exports.updatePermission = exports.createPermission = exports.getPermissionById = exports.getAllPermissions = void 0;
const permisos_repository_1 = require("../../repositories/permisos.repository");
const getAllPermissions = () => permisos_repository_1.PermissionRepository.findAll();
exports.getAllPermissions = getAllPermissions;
const getPermissionById = async (id) => {
    const perm = await permisos_repository_1.PermissionRepository.findById(id);
    if (!perm)
        throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });
    return perm;
};
exports.getPermissionById = getPermissionById;
const createPermission = async (data) => {
    const existing = await permisos_repository_1.PermissionRepository.findByName(data.name);
    if (existing)
        throw Object.assign(new Error('Ya existe un permiso con ese nombre'), { status: 409 });
    return permisos_repository_1.PermissionRepository.create(data);
};
exports.createPermission = createPermission;
const updatePermission = async (id, data) => {
    const perm = await permisos_repository_1.PermissionRepository.findById(id);
    if (!perm)
        throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });
    const [, updated] = await permisos_repository_1.PermissionRepository.update(id, data);
    return updated?.[0] || perm;
};
exports.updatePermission = updatePermission;
const deletePermission = async (id) => {
    const perm = await permisos_repository_1.PermissionRepository.findById(id);
    if (!perm)
        throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });
    await permisos_repository_1.PermissionRepository.delete(id);
    return { message: 'Permiso eliminado' };
};
exports.deletePermission = deletePermission;
//# sourceMappingURL=permisos.usecase.js.map