import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class SitioUser extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare password_hash: string | null;
  declare status: string;
  declare created_by: string | null;
  declare last_login_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;
}

SitioUser.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false },
    email: { type: DataTypes.TEXT, allowNull: false, unique: true },
    password_hash: { type: DataTypes.TEXT },
    status: { type: DataTypes.TEXT, defaultValue: 'active' },
    created_by: { type: DataTypes.UUID },
    last_login_at: { type: DataTypes.DATE },
  },
  { sequelize, tableName: 'usuarios_sitio', timestamps: true, underscored: true }
);
