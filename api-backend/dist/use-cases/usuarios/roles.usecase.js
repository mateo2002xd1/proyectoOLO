"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleById = exports.getAllRoles = void 0;
const roles_repository_1 = require("../../repositories/roles.repository");
const getAllRoles = () => roles_repository_1.RoleRepository.findAll();
exports.getAllRoles = getAllRoles;
const getRoleById = async (id) => {
    const role = await roles_repository_1.RoleRepository.findById(id);
    if (!role)
        throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
    return role;
};
exports.getRoleById = getRoleById;
const createRole = async (data) => {
    const existing = await roles_repository_1.RoleRepository.findByName(data.name);
    if (existing)
        throw Object.assign(new Error('Ya existe un rol con ese nombre'), { status: 409 });
    return roles_repository_1.RoleRepository.create(data);
};
exports.createRole = createRole;
const updateRole = async (id, data) => {
    const role = await roles_repository_1.RoleRepository.findById(id);
    if (!role)
        throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
    const [, updated] = await roles_repository_1.RoleRepository.update(id, data);
    return updated?.[0] || role;
};
exports.updateRole = updateRole;
const deleteRole = async (id) => {
    const role = await roles_repository_1.RoleRepository.findById(id);
    if (!role)
        throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
    await roles_repository_1.RoleRepository.delete(id);
    return { message: 'Rol eliminado' };
};
exports.deleteRole = deleteRole;
//# sourceMappingURL=roles.usecase.js.map