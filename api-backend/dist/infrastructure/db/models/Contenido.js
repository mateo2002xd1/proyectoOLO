"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contenido = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../../config/database"));
class Contenido extends sequelize_1.Model {
}
exports.Contenido = Contenido;
Contenido.init({
    id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
    title: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    slug: { type: sequelize_1.DataTypes.TEXT, allowNull: false, unique: true },
    excerpt: { type: sequelize_1.DataTypes.TEXT },
    content: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    sectionId: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    authorId: { type: sequelize_1.DataTypes.TEXT },
    publishedAt: { type: sequelize_1.DataTypes.DATE },
}, {
    sequelize: database_1.default,
    // Tabla histórica 'Post' — el modelo se renombró a Contenido pero la tabla SQL no se migró.
    tableName: 'Post',
    timestamps: true,
    freezeTableName: true,
    indexes: [
        { fields: ['slug'] },
        { fields: ['sectionId'] },
        { fields: ['authorId'] },
        { fields: ['publishedAt'] }
    ]
});
//# sourceMappingURL=Contenido.js.map