import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';
import Departamento from './departamento';

/**
 * Tabla `municipios`: catálogo **abierto**, a diferencia de `departamentos` (cerrado,
 * migración 032). Lo completa el importador de "Alertas de inversión" por
 * `(departamento_id, nombre)`, igual que `centros_formacion` con el Observatorio.
 */
class Municipio extends Model {
  declare id: string;
  declare departamento_id: string;
  declare nombre: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  declare departamento?: Departamento;
}

Municipio.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    departamento_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Departamento, key: 'id' },
    },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'municipios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // Único por departamento y nombre normalizado («Medellín» = «Medellin»): migración 042.
    indexes: [
      {
        unique: true,
        fields: ['departamento_id', sequelize.fn('normalizar_nombre', sequelize.col('nombre'))],
        name: 'uq_municipios_depto_nombre',
      },
    ],
  }
);

export default Municipio;
