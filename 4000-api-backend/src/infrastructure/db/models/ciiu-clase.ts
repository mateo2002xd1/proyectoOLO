import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';
import CiiuSeccion from './ciiu-seccion';

/** Tabla `ciiu_clases`: código de 4 dígitos dentro de una sección CIIU. */
class CiiuClase extends Model {
  declare id: string;
  declare seccion_id: string;
  declare codigo: string;
  declare nombre: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  declare seccion?: CiiuSeccion;
}

CiiuClase.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    seccion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: CiiuSeccion, key: 'id' },
    },
    codigo: { type: DataTypes.CHAR(4), allowNull: false },
    nombre: { type: DataTypes.STRING(300), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'ciiu_clases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['seccion_id', 'codigo'], name: 'uq_ciiu_clases_seccion_codigo' }],
  }
);

export default CiiuClase;
