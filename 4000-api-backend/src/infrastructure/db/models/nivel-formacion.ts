import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

/** Tabla `niveles_formacion`: los niveles de formación (técnico, tecnólogo…). */
class NivelFormacion extends Model {
  declare id: string;
  declare nombre: string;
  declare codigo: string | null;
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
    },
    // Código SENA (`Cod. Nivel de formación` del Excel): es lo que identifica al nivel
    // desde la migración 042, no el nombre. Nulo solo en filas anteriores a esa migración.
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
    tableName: 'niveles_formacion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default NivelFormacion;
