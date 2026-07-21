import { Contenido } from '../infrastructure/db/models';
export declare const ContenidoRepository: {
    findAll: (where?: any) => Promise<Contenido[]>;
    findById: (id: string) => Promise<Contenido | null>;
    findBySlug: (slug: string) => Promise<Contenido | null>;
    globalLookup: (term: string) => Promise<Contenido[]>;
    create: (data: any) => Promise<Contenido>;
    update: (id: string, data: any) => Promise<[affectedCount: number, affectedRows: Contenido[]]>;
    delete: (id: string) => Promise<number>;
};
//# sourceMappingURL=contenido.repository.d.ts.map