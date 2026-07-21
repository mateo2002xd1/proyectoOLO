"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityQuestion = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class SecurityQuestion extends sequelize_1.Model {
}
exports.SecurityQuestion = SecurityQuestion;
SecurityQuestion.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    question_key: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    answer_hash: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    sort_order: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
}, {
    sequelize: database_1.default,
    tableName: 'security_questions',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['user_id', 'question_key'] }],
});
//# sourceMappingURL=SecurityQuestion.js.map