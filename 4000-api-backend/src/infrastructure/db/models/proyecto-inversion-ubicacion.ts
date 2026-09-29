import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';
import ProyectoInversion from './proyecto-inversion';
import Departamento from './departamento';
import Municipio from './municipio';

/** Tabla `proyectos_inversion_ubicaciones`: puente N:M proyecto↔ubicación (calcada de `roles_permisos`). */
class ProyectoInversionUbicacion extends Model {
  declare id: string;
  declare proyecto_id: string;
  declare departamento_id: string;
  declare municipio_id: string | null;
  declare readonly created_at: Date;

  declare departamento?: Departamento;
  declare municipio?: Municipio;
}

ProyectoInversionUbicacion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    proyecto_id: { type: DataTypes.UUID, allowNull: false, references: { model: ProyectoInversion, key: 'id' } },
    departamento_id: { type: DataTypes.UUID, allowNull: false, references: { model: Departamento, key: 'id' } },
    municipio_id: { type: DataTypes.UUID, allowNull: true, references: { model: Municipio, key: 'id' } },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'proyectos_inversion_ubicaciones',
    timestamps: false,
  }
);

export default ProyectoInversionUbicacion;
