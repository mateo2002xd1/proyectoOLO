"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attachment = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class Attachment extends sequelize_1.Model {
}
exports.Attachment = Attachment;
Attachment.init({
    id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
    postId: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    fileName: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    filePath: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    mimeType: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    sizeBytes: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, { sequelize: database_1.default, tableName: 'Attachment', timestamps: true, freezeTableName: true });
//# sourceMappingURL=Attachment.js.map