import { User } from '../infrastructure/db/models';
export declare const UserRepository: {
    findAll: () => Promise<User[]>;
    findById: (id: string) => Promise<User | null>;
    findByIdWithPassword: (id: string) => Promise<User | null>;
    findByEmail: (email: string) => Promise<User | null>;
    create: (data: any) => Promise<User>;
    update: (id: string, data: any) => Promise<[affectedCount: number, affectedRows: User[]]>;
    delete: (id: string) => Promise<number>;
    updateLastAccess: (id: string) => Promise<[affectedCount: number]>;
};
//# sourceMappingURL=usuarios.repository.d.ts.map