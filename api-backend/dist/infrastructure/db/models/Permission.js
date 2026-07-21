"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class Permission extends sequelize_1.Model {
}
exports.Permission = Permission;
Permission.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    name: { type: sequelize_1.DataTypes.TEXT, allowNull: false, unique: true },
}, { sequelize: database_1.default, tableName: 'permissions', timestamps: true, underscored: true });
//# sourceMappingURL=Permission.js.map