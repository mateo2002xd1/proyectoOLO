import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';
import Departamento from './departamento';

/** Tabla `centros_formacion`: los centros del SENA, cada uno en su departamento. */
class CentroFormacion extends Model {
  declare id: string;
  declare departamento_id: string;
  declare nombre: string;
  declare codigo: string | null;
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
    // Código SENA (`Cod. Centro`): identifica al centro desde la migración 042. El nombre
    // no: «Centro de Comercio y Servicios» son cinco centros distintos.
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: true,
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
    tableName: 'centros_formacion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default CentroFormacion;
