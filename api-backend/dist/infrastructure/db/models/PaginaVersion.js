"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginaVersion = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class PaginaVersion extends sequelize_1.Model {
}
exports.PaginaVersion = PaginaVersion;
PaginaVersion.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    paginaId: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    contenido: { type: sequelize_1.DataTypes.JSONB, allowNull: false },
    layout: { type: sequelize_1.DataTypes.JSONB },
    numeroVersion: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    estado: { type: sequelize_1.DataTypes.STRING(20), defaultValue: 'borrador' },
    motivoRechazo: { type: sequelize_1.DataTypes.TEXT },
    revisorId: { type: sequelize_1.DataTypes.UUID },
    publicadoPor: { type: sequelize_1.DataTypes.UUID },
    publicadoEn: { type: sequelize_1.DataTypes.DATE },
}, { sequelize: database_1.default, tableName: 'paginas_versiones', timestamps: true, underscored: true, createdAt: 'creadoEn', updatedAt: false });
//# sourceMappingURL=PaginaVersion.js.map