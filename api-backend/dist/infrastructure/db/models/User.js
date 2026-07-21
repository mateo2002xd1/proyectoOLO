"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    name: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    email: { type: sequelize_1.DataTypes.TEXT, allowNull: false, unique: true },
    password_hash: { type: sequelize_1.DataTypes.TEXT },
    role_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    status: { type: sequelize_1.DataTypes.TEXT, allowNull: false, defaultValue: 'active' },
    expiration_date: { type: sequelize_1.DataTypes.DATE },
    last_access_at: { type: sequelize_1.DataTypes.DATE },
    must_setup_security_questions: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
    must_change_password: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
    failed_security_attempts: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
    locked_until: { type: sequelize_1.DataTypes.DATE },
}, {
    sequelize: database_1.default,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['email'] },
        { fields: ['role_id'] },
        { fields: ['status'] }
    ]
});
//# sourceMappingURL=User.js.map