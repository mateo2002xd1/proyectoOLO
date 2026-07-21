export declare const getAttachmentsByPost: (contenidoId: string) => Promise<import("../../infrastructure/db/models").Attachment[]>;
export declare const createAttachment: (contenidoId: string, fileData: any) => Promise<import("../../infrastructure/db/models").Attachment>;
export declare const deleteAttachment: (id: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=adjuntos.usecase.d.ts.map