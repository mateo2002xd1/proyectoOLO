export declare const logAudit: (data: any) => void;
export declare const getAuditByContentId: (contentId: string, contentType?: string) => Promise<import("../../infrastructure/db/models").ContentAuditLog[]>;
export declare const getAllAudit: (params: any) => Promise<{
    logs: import("../../infrastructure/db/models").ContentAuditLog[];
    total: number;
    page: any;
    totalPages: number;
}>;
//# sourceMappingURL=audit.usecase.d.ts.map