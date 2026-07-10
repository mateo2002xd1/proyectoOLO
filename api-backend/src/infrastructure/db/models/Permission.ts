import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Permission extends Model {
  declare id: string;
  declare name: string;
  declare created_at: Date;
  declare updated_at: Date;
}

Permission.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false, unique: true },
  },
  { sequelize, tableName: 'permissions', timestamps: true, underscored: true }
);
