import { Model } from 'sequelize';
export declare class Contenido extends Model {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    sectionId: string;
    authorId: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    section?: any;
    attachments?: any[];
}
//# sourceMappingURL=Contenido.d.ts.map