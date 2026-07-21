export interface AuditEventData {
    contentId: string;
    contentType: string;
    userId: string | null;
    userName: string | null;
    actionType: string;
    modifiedFields: any[];
}
export declare const auditoriaListener: (data: AuditEventData) => void;
//# sourceMappingURL=auditoria.listener.d.ts.map