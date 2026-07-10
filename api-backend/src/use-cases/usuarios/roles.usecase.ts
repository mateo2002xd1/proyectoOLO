import { RoleRepository } from '../../repositories/roles.repository';

export const getAllRoles = () => RoleRepository.findAll();

export const getRoleById = async (id: string) => {
  const role = await RoleRepository.findById(id);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
  return role;
};

export const createRole = async (data: any) => {
  const existing = await RoleRepository.findByName(data.name);
  if (existing) throw Object.assign(new Error('Ya existe un rol con ese nombre'), { status: 409 });
  return RoleRepository.create(data);
};

export const updateRole = async (id: string, data: any) => {
  const role = await RoleRepository.findById(id);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
  const [, updated] = await RoleRepository.update(id, data);
  return updated?.[0] || role;
};

export const deleteRole = async (id: string) => {
  const role = await RoleRepository.findById(id);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
  await RoleRepository.delete(id);
  return { message: 'Rol eliminado' };
};
