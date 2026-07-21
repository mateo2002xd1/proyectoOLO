export declare const getAllPermissions: () => Promise<import("../../infrastructure/db/models").Permission[]>;
export declare const getPermissionById: (id: string) => Promise<import("../../infrastructure/db/models").Permission>;
export declare const createPermission: (data: any) => Promise<import("../../infrastructure/db/models").Permission>;
export declare const updatePermission: (id: string, data: any) => Promise<import("../../infrastructure/db/models").Permission>;
export declare const deletePermission: (id: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=permisos.usecase.d.ts.map