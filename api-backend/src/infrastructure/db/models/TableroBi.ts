import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class TableroBi extends Model {
  declare id: string;
  declare nombre: string;
  declare descripcion: string | null;
  declare url: string;
  declare pageName: string | null;
  declare ambito: 'sitio' | 'intranet';
  declare activo: boolean;
  declare creadoPor: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

// RF-08: los tableros Power BI dejan de estar escritos a mano en los componentes y
// pasan a ser dato editable desde el CMS.
// Los bloques Puck guardan `tablero_id`, no la URL, así que cambiar el informe se hace
// una vez. La URL se valida en el servidor contra la lista blanca de dominios antes de
// guardarse (S6); el modelo no es el lugar de esa comprobación.
TableroBi.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.TEXT, allowNull: false, unique: true },
    descripcion: { type: DataTypes.TEXT },
    url: { type: DataTypes.TEXT, allowNull: false },
    pageName: { type: DataTypes.TEXT, field: 'page_name' },
    ambito: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'intranet' },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    creadoPor: { type: DataTypes.UUID, field: 'creado_por' },
  },
  { sequelize, tableName: 'tableros_bi', timestamps: true, underscored: true }
);
