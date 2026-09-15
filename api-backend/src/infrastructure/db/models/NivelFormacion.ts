import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

class NivelFormacion extends Model {
  declare id: string;
  declare nombre: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

NivelFormacion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
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
    tableName: 'niveles_formacion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default NivelFormacion;
