import { Model } from 'sequelize';
export declare class ContentAuditLog extends Model {
    id: string;
    content_id: string;
    content_type: string;
    user_id: string | null;
    user_name: string | null;
    action_type: string;
    modified_fields: any[];
    created_at: Date;
}
//# sourceMappingURL=ContentAuditLog.d.ts.map