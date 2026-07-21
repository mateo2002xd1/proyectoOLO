"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class Role extends sequelize_1.Model {
}
exports.Role = Role;
Role.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    name: { type: sequelize_1.DataTypes.TEXT, allowNull: false, unique: true },
    description: { type: sequelize_1.DataTypes.TEXT },
}, { sequelize: database_1.default, tableName: 'roles', timestamps: true, underscored: true });
//# sourceMappingURL=Role.js.map