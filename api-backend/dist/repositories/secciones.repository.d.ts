import { Section } from '../infrastructure/db/models';
export declare const SectionRepository: {
    findAll: () => Promise<Section[]>;
    findById: (id: string) => Promise<Section | null>;
    findBySlug: (slug: string) => Promise<Section | null>;
    create: (data: any) => Promise<Section>;
    update: (id: string, data: any) => Promise<[affectedCount: number, affectedRows: Section[]]>;
    delete: (id: string) => Promise<number>;
};
//# sourceMappingURL=secciones.repository.d.ts.map