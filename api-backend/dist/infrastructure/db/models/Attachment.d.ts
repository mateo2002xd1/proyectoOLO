import { Model } from 'sequelize';
export declare class Attachment extends Model {
    id: string;
    postId: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: Date;
}
//# sourceMappingURL=Attachment.d.ts.map