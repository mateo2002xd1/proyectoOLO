import { RolePermission } from '../infrastructure/db/models';
export declare const RolePermissionRepository: {
    findAll: () => Promise<RolePermission[]>;
    findByRole: (role_id: string) => Promise<RolePermission[]>;
    assign: (role_id: string, permission_id: string) => Promise<[RolePermission, boolean]>;
    revoke: (role_id: string, permission_id: string) => Promise<number>;
    revokeAll: (role_id: string) => Promise<number>;
    getPermissionsByRole: (roleName: string) => Promise<string[]>;
};
//# sourceMappingURL=role-permissions.repository.d.ts.map