import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';
import NivelFormacion from './nivel-formacion';

/** Tabla `programas_formacion`: los programas de formación, cada uno con su nivel. */
class ProgramaFormacion extends Model {
  declare id: string;
  declare nivel_formacion_id: string;
  declare nombre: string;
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
    indexes: [
      {
        unique: true,
        fields: ['nivel_formacion_id', 'nombre'],
        name: 'uq_programas_formacion_nivel_nombre',
      },
    ],
  }
);

export default ProgramaFormacion;
