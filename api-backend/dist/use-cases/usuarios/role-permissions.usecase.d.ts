export declare const getAllRolePermissions: () => Promise<import("../../infrastructure/db/models").RolePermission[]>;
export declare const getByRole: (roleId: string) => Promise<import("../../infrastructure/db/models").RolePermission[]>;
export declare const assignPermission: (role_id: string, permission_id: string) => Promise<{
    record: import("../../infrastructure/db/models").RolePermission;
    created: boolean;
}>;
export declare const revokePermission: (role_id: string, permission_id: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=role-permissions.usecase.d.ts.map