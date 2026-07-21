"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class Section extends sequelize_1.Model {
}
exports.Section = Section;
Section.init({
    id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
    name: { type: sequelize_1.DataTypes.TEXT, allowNull: false, unique: true },
    slug: { type: sequelize_1.DataTypes.TEXT, allowNull: false, unique: true },
    description: { type: sequelize_1.DataTypes.TEXT },
}, { sequelize: database_1.default, tableName: 'Section', timestamps: true, freezeTableName: true });
//# sourceMappingURL=Section.js.map