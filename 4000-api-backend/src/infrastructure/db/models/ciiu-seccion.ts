import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

/** Tabla `ciiu_secciones`: catálogo CIIU Rev.4 A.C. (DANE), sección A–U. */
class CiiuSeccion extends Model {
  declare id: string;
  declare letra: string;
  declare nombre: string;
  declare divisiones: string;
  declare activa: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

CiiuSeccion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    letra: { type: DataTypes.CHAR(1), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(250), allowNull: false },
    divisiones: { type: DataTypes.STRING(10), allowNull: false },
    activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'ciiu_secciones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default CiiuSeccion;
