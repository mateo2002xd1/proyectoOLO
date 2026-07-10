import { PermissionRepository } from '../../repositories/permisos.repository';

export const getAllPermissions = () => PermissionRepository.findAll();

export const getPermissionById = async (id: string) => {
  const perm = await PermissionRepository.findById(id);
  if (!perm) throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });
  return perm;
};

export const createPermission = async (data: any) => {
  const existing = await PermissionRepository.findByName(data.name);
  if (existing) throw Object.assign(new Error('Ya existe un permiso con ese nombre'), { status: 409 });
  return PermissionRepository.create(data);
};

export const updatePermission = async (id: string, data: any) => {
  const perm = await PermissionRepository.findById(id);
  if (!perm) throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });
  const [, updated] = await PermissionRepository.update(id, data);
  return updated?.[0] || perm;
};

export const deletePermission = async (id: string) => {
  const perm = await PermissionRepository.findById(id);
  if (!perm) throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });
  await PermissionRepository.delete(id);
  return { message: 'Permiso eliminado' };
};
