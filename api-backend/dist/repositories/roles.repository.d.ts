import { Role } from '../infrastructure/db/models';
export declare const RoleRepository: {
    findAll: () => Promise<Role[]>;
    findById: (id: string) => Promise<Role | null>;
    findByName: (name: string) => Promise<Role | null>;
    create: (data: any) => Promise<Role>;
    update: (id: string, data: any) => Promise<[affectedCount: number, affectedRows: Role[]]>;
    delete: (id: string) => Promise<number>;
};
//# sourceMappingURL=roles.repository.d.ts.map