import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';
import Departamento from './departamento';

class CentroFormacion extends Model {
  declare id: string;
  declare departamento_id: string;
  declare nombre: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  
  declare departamento?: Departamento;
}

CentroFormacion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    departamento_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Departamento,
        key: 'id',
      },
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: 'centros_formacion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['departamento_id', 'nombre'],
        name: 'uq_centros_formacion_depto_nombre',
      },
    ],
  }
);

export default CentroFormacion;
