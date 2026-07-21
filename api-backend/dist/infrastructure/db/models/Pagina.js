"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pagina = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class Pagina extends sequelize_1.Model {
}
exports.Pagina = Pagina;
Pagina.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    slug: { type: sequelize_1.DataTypes.STRING(255), allowNull: false, unique: true },
    titulo: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    versionPublicadaId: { type: sequelize_1.DataTypes.UUID, allowNull: true },
    creadoPor: { type: sequelize_1.DataTypes.UUID, allowNull: true },
}, {
    sequelize: database_1.default,
    tableName: 'paginas',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['slug'] },
        { fields: ['creado_por'] }
    ]
});
//# sourceMappingURL=Pagina.js.map