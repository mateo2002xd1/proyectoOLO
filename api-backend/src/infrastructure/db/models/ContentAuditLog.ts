import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class ContentAuditLog extends Model {
  declare id: string;
  declare content_id: string;
  declare content_type: string;
  declare user_id: string | null;
  declare user_name: string | null;
  declare action_type: string;
  declare modified_fields: any[];
  declare created_at: Date;
}

ContentAuditLog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    content_id: { type: DataTypes.UUID, allowNull: false },
    content_type: { type: DataTypes.TEXT, defaultValue: 'post' },
    user_id: { type: DataTypes.UUID },
    user_name: { type: DataTypes.TEXT },
    action_type: { type: DataTypes.TEXT, allowNull: false },
    modified_fields: { type: DataTypes.JSONB, defaultValue: [] },
  },
  { sequelize, tableName: 'content_audit_logs', timestamps: true, underscored: true }
);
