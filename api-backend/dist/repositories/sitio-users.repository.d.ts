import { SitioUser } from '../infrastructure/db/models';
export declare const SitioUserRepository: {
    findAll: () => Promise<SitioUser[]>;
    findById: (id: string) => Promise<SitioUser | null>;
    findByIdWithPassword: (id: string) => Promise<SitioUser | null>;
    findByEmail: (email: string) => Promise<SitioUser | null>;
    create: (data: any) => Promise<SitioUser>;
    update: (id: string, data: any) => Promise<[affectedCount: number, affectedRows: SitioUser[]]>;
    delete: (id: string) => Promise<number>;
    updateLastLogin: (id: string) => Promise<[affectedCount: number]>;
};
//# sourceMappingURL=sitio-users.repository.d.ts.map