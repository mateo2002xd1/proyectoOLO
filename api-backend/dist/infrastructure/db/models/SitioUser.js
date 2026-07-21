"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitioUser = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class SitioUser extends sequelize_1.Model {
}
exports.SitioUser = SitioUser;
SitioUser.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    name: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    email: { type: sequelize_1.DataTypes.TEXT, allowNull: false, unique: true },
    password_hash: { type: sequelize_1.DataTypes.TEXT },
    status: { type: sequelize_1.DataTypes.TEXT, defaultValue: 'active' },
    created_by: { type: sequelize_1.DataTypes.UUID },
    last_login_at: { type: sequelize_1.DataTypes.DATE },
}, {
    sequelize: database_1.default,
    tableName: 'usuarios_sitio',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['email'] },
        { fields: ['status'] }
    ]
});
//# sourceMappingURL=SitioUser.js.map