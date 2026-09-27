import { RolePermission, Role, Permission } from '../infrastructure/db/models';

export const RolePermissionRepository = {
  /** Todas las asignaciones rol ↔ permiso. */
  findAll: () => RolePermission.findAll(),

  /** Las asignaciones de un rol. */
  findByRole: (role_id: string) =>
    RolePermission.findAll({ where: { role_id } }),

  /** Asigna un permiso a un rol si no lo tenía; devuelve `[fila, creada]`. */
  assign: (role_id: string, permission_id: string) =>
    RolePermission.findOrCreate({ where: { role_id, permission_id } }),

  /** Quita un permiso a un rol. */
  revoke: (role_id: string, permission_id: string) =>
    RolePermission.destroy({ where: { role_id, permission_id } }),


  /** Las claves de permiso de un rol, buscándolo por nombre; `[]` si no existe. */
  getPermissionsByRole: async (roleName: string): Promise<string[]> => {
    const role = await Role.findOne({ 
      where: { name: roleName },
      include: [{
        model: Permission,
        as: 'permissions',
        attributes: ['name']
      }]
    });
    
    if (!role || !role.get('permissions')) return [];
    const perms = role.get('permissions') as any[];
    return perms.map(p => p.name);
  }
};
