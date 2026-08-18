import { RoleRepository } from '../../repositories/roles.repository';
import { invalidarPermisosDeRol } from '../../middlewares/require-permission.middleware';

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

  const nombreAnterior = (role as any).name;
  const [, updated] = await RoleRepository.update(id, data);

  // La caché de permisos se indexa por **nombre** de rol, que es lo que viaja en el JWT.
  // Renombrar deja viva la entrada del nombre viejo, así que se olvidan las dos: la
  // anterior porque ya no corresponde a nadie, la nueva porque puede haber quedado
  // poblada por un nombre reutilizado.
  invalidarPermisosDeRol(nombreAnterior);
  if (data?.name && data.name !== nombreAnterior) invalidarPermisosDeRol(data.name);

  return updated?.[0] || role;
};

export const deleteRole = async (id: string) => {
  const role = await RoleRepository.findById(id);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
  await RoleRepository.delete(id);

  invalidarPermisosDeRol((role as any).name);

  return { message: 'Rol eliminado' };
};
