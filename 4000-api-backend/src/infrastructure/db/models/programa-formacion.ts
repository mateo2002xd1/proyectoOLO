import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';
import NivelFormacion from './nivel-formacion';

/** Tabla `programas_formacion`: los programas de formación, cada uno con su nivel. */
class ProgramaFormacion extends Model {
  declare id: string;
  declare nivel_formacion_id: string;
  declare nombre: string;
  declare codigo: string | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  
  declare nivelFormacion?: NivelFormacion;
}

ProgramaFormacion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nivel_formacion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: NivelFormacion,
        key: 'id',
      },
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // Código SENA (`Cod. Programa`): identifica al programa desde la migración 042. Dos
    // programas del mismo nivel pueden llamarse igual (134507 y 134508).
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
    tableName: 'programas_formacion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ProgramaFormacion;
