import { RolePermissionRepository } from '../../repositories/role-permissions.repository';
import { RoleRepository } from '../../repositories/roles.repository';
import { PermissionRepository } from '../../repositories/permisos.repository';
import { invalidarPermisosDeRol } from '../../middlewares/require-permission.middleware';

export const getAllRolePermissions = () => RolePermissionRepository.findAll();

export const getByRole = async (roleId: string) => {
  const role = await RoleRepository.findById(roleId);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
  return RolePermissionRepository.findByRole(roleId);
};

/**
 * `permiso` se devuelve además del registro para que la bitácora pueda decir qué
 * permiso se movió y no solo su UUID. Es aditivo: quien ya consumía la respuesta
 * (el panel solo mira el estado HTTP) sigue igual.
 */
export const assignPermission = async (role_id: string, permission_id: string) => {
  const role = await RoleRepository.findById(role_id);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });

  const perm = await PermissionRepository.findById(permission_id);
  if (!perm) throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });

  const [record, created] = await RolePermissionRepository.assign(role_id, permission_id);

  // Sin esto el cambio no se notaría hasta que venciera la caché del middleware, y un
  // control de acceso que tarda en aplicarse no es un control de acceso. Va después de
  // escribir: si la escritura falla, no hay nada que invalidar.
  invalidarPermisosDeRol((role as any).name);

  return { record, created, permiso: (perm as any).name ?? permission_id };
};

export const revokePermission = async (role_id: string, permission_id: string) => {
  // Se lee antes de borrar y sin exigir que exista: solo sirve para nombrar el
  // permiso en la bitácora, y quedarse sin nombre no debe impedir revocarlo.
  const perm = await PermissionRepository.findById(permission_id).catch(() => null);
  const role = await RoleRepository.findById(role_id).catch(() => null);

  const deleted = await RolePermissionRepository.revoke(role_id, permission_id);
  if (!deleted) throw Object.assign(new Error('Asignación no encontrada'), { status: 404 });

  // Revocar es el caso donde el retraso importa de verdad: quien pierde un permiso debe
  // perderlo ya, no cuando venza una caché.
  invalidarPermisosDeRol((role as any)?.name);

  return { message: 'Permiso revocado', permiso: (perm as any)?.name ?? permission_id };
};
