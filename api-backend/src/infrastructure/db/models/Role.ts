import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Role extends Model {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare es_sistema: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

Role.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false, unique: true, field: 'nombre' },
    description: { type: DataTypes.TEXT, field: 'descripcion' },
    // Los roles del dominio no se borran desde el panel: sin ellos no hay gobernanza.
    es_sistema: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, tableName: 'roles', timestamps: true, underscored: true }
);
