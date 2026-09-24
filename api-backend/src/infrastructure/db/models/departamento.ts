import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

class Departamento extends Model {
  declare id: string;
  declare nombre: string;
  declare codigo_dane: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Departamento.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    // Obligatorio y único desde la migración 032: el catálogo son los 33 oficiales.
    codigo_dane: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'departamentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Departamento;
