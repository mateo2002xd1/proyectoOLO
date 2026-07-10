import { RolePermissionRepository } from '../../repositories/role-permissions.repository';
import { RoleRepository } from '../../repositories/roles.repository';
import { PermissionRepository } from '../../repositories/permisos.repository';

export const getAllRolePermissions = () => RolePermissionRepository.findAll();

export const getByRole = async (roleId: string) => {
  const role = await RoleRepository.findById(roleId);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
  return RolePermissionRepository.findByRole(roleId);
};

export const assignPermission = async (role_id: string, permission_id: string) => {
  const role = await RoleRepository.findById(role_id);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });

  const perm = await PermissionRepository.findById(permission_id);
  if (!perm) throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });

  const [record, created] = await RolePermissionRepository.assign(role_id, permission_id);
  return { record, created };
};

export const revokePermission = async (role_id: string, permission_id: string) => {
  const deleted = await RolePermissionRepository.revoke(role_id, permission_id);
  if (!deleted) throw Object.assign(new Error('Asignación no encontrada'), { status: 404 });
  return { message: 'Permiso revocado' };
};
