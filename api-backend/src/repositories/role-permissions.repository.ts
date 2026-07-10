import { RolePermission, Role, Permission } from '../infrastructure/db/models';

export const RolePermissionRepository = {
  findAll: () => RolePermission.findAll(),

  findByRole: (role_id: string) =>
    RolePermission.findAll({ where: { role_id } }),

  assign: (role_id: string, permission_id: string) =>
    RolePermission.findOrCreate({ where: { role_id, permission_id } }),

  revoke: (role_id: string, permission_id: string) =>
    RolePermission.destroy({ where: { role_id, permission_id } }),

  revokeAll: (role_id: string) =>
    RolePermission.destroy({ where: { role_id } }),

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
