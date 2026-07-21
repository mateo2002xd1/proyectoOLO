"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermission = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class RolePermission extends sequelize_1.Model {
}
exports.RolePermission = RolePermission;
RolePermission.init({
    role_id: { type: sequelize_1.DataTypes.UUID, allowNull: false, primaryKey: true },
    permission_id: { type: sequelize_1.DataTypes.UUID, allowNull: false, primaryKey: true },
}, { sequelize: database_1.default, tableName: 'role_permissions', timestamps: false });
//# sourceMappingURL=RolePermission.js.map