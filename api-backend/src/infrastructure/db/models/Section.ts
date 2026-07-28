import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Section extends Model {
  declare id: string;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare padreId: string | null;
  declare orden: number;
  declare nivel: number;
  declare visibleEnMenu: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

// `name`/`description` siguen siendo el contrato de la API; la columna es `nombre` y
// `descripcion`. Ver la nota del modelo Contenido.
Section.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false, unique: true, field: 'nombre' },
    slug: { type: DataTypes.TEXT, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, field: 'descripcion' },
    // Árbol de navegación de RF-11: `nivel` no pasa de 3 y la base lo impone.
    padreId: { type: DataTypes.UUID, field: 'padre_id' },
    orden: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
    nivel: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 },
    visibleEnMenu: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'visible_en_menu',
    },
  },
  { sequelize, tableName: 'secciones', timestamps: true, underscored: true }
);
