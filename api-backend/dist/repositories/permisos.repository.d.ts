import { Permission } from '../infrastructure/db/models';
export declare const PermissionRepository: {
    findAll: () => Promise<Permission[]>;
    findById: (id: string) => Promise<Permission | null>;
    findByName: (name: string) => Promise<Permission | null>;
    create: (data: any) => Promise<Permission>;
    update: (id: string, data: any) => Promise<[affectedCount: number, affectedRows: Permission[]]>;
    delete: (id: string) => Promise<number>;
};
//# sourceMappingURL=permisos.repository.d.ts.map