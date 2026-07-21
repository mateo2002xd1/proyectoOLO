"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentAuditLog = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class ContentAuditLog extends sequelize_1.Model {
}
exports.ContentAuditLog = ContentAuditLog;
ContentAuditLog.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    content_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    content_type: { type: sequelize_1.DataTypes.TEXT, defaultValue: 'post' },
    user_id: { type: sequelize_1.DataTypes.UUID },
    user_name: { type: sequelize_1.DataTypes.TEXT },
    action_type: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    modified_fields: { type: sequelize_1.DataTypes.JSONB, defaultValue: [] },
}, { sequelize: database_1.default, tableName: 'content_audit_logs', timestamps: true, underscored: true });
//# sourceMappingURL=ContentAuditLog.js.map