import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

/** Tabla `empresas`: catálogo de empresas que anuncian proyectos de inversión. */
class Empresa extends Model {
  declare id: string;
  declare nombre: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Empresa.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'empresas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // Único por nombre normalizado («Grupo Éxito» = «GRUPO EXITO»): migración 042.
    indexes: [
      { unique: true, fields: [sequelize.fn('normalizar_nombre', sequelize.col('nombre'))], name: 'uq_empresas_nombre' },
    ],
  }
);

export default Empresa;
