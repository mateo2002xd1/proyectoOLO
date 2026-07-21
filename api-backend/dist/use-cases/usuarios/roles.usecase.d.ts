export declare const getAllRoles: () => Promise<import("../../infrastructure/db/models").Role[]>;
export declare const getRoleById: (id: string) => Promise<import("../../infrastructure/db/models").Role>;
export declare const createRole: (data: any) => Promise<import("../../infrastructure/db/models").Role>;
export declare const updateRole: (id: string, data: any) => Promise<import("../../infrastructure/db/models").Role>;
export declare const deleteRole: (id: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=roles.usecase.d.ts.map