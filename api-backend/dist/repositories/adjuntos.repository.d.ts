import { Attachment } from '../infrastructure/db/models';
export declare const AttachmentRepository: {
    findByPost: (postId: string) => Promise<Attachment[]>;
    findById: (id: string) => Promise<Attachment | null>;
    create: (data: any) => Promise<Attachment>;
    delete: (id: string) => Promise<number>;
    deleteByPost: (postId: string) => Promise<number>;
};
//# sourceMappingURL=adjuntos.repository.d.ts.map