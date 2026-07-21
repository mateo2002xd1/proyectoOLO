import { ContentAuditLog } from '../infrastructure/db/models';
export declare const AuditRepository: {
    create: (data: any) => Promise<ContentAuditLog>;
    findByContentId: (contentId: string, contentType?: string) => Promise<ContentAuditLog[]>;
    findAll: ({ page, limit, contentType, userId, actionType }?: any) => Promise<{
        logs: ContentAuditLog[];
        total: number;
        page: any;
        totalPages: number;
    }>;
};
//# sourceMappingURL=auditoria.repository.d.ts.map