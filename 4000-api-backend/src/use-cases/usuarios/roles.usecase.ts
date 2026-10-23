import { RoleRepository } from '../../repositories/roles.repository';
import { User } from '../../infrastructure/db/models';
import { invalidarPermisosDeRol } from '../../shared/permisos-de-rol';
import { esRolProtegido } from '../../shared/roles-protegidos';

/** El 403 de los roles que define el sistema (ver `roles-protegidos.ts`). */
const errorRolProtegido = () =>
  Object.assign(new Error('Este rol lo define el sistema y no se puede modificar desde el panel'), {
    status: 403,
  });

/** Los roles con sus permisos, sin Superadmin. */
export const getAllRoles = () => RoleRepository.findAll();

/**
 * Un rol por su id, con sus permisos.
 * @throws {Error} 404 si no existe.
 */
export const getRoleById = async (id: string) => {
  const role = await RoleRepository.findById(id);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
  return role;
};

/**
 * Crea un rol con un nombre que no exista.
 * @throws {Error} 409 si el nombre ya está usado.
 */
export const createRole = async (data: any) => {
  const existing = await RoleRepository.findByName(data.name);
  if (existing) throw Object.assign(new Error('Ya existe un rol con ese nombre'), { status: 409 });
  return RoleRepository.create(data);
};

/**
 * Actualiza un rol y vacía la caché de permisos del nombre viejo y del nuevo.
 * @throws {Error} 404 si no existe; 403 si es un rol protegido.
 */
export const updateRole = async (id: string, data: any) => {
  const role = await RoleRepository.findById(id);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
  if (esRolProtegido((role as any).name)) throw errorRolProtegido();

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

/**
 * Elimina un rol y vacía su caché de permisos.
 * @throws {Error} 404 si no existe; 403 si es un rol protegido.
 */
export const deleteRole = async (id: string) => {
  const role = await RoleRepository.findById(id);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
  if (esRolProtegido((role as any).name)) throw errorRolProtegido();

  const usuariosConRol = await User.count({ where: { role_id: id } });
  if (usuariosConRol > 0) {
    throw Object.assign(
      new Error(
        `No se puede eliminar el rol «${(role as any).name}» porque está asignado a ${usuariosConRol} usuario(s). Reasigna los usuarios a otro rol antes de eliminarlo.`
      ),
      { status: 400 }
    );
  }

  await RoleRepository.delete(id);

  invalidarPermisosDeRol((role as any).name);

  return { message: 'Rol eliminado' };
};
