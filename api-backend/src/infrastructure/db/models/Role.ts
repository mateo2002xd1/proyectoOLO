import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Role extends Model {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare created_at: Date;
  declare updated_at: Date;
}

Role.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
  },
  { sequelize, tableName: 'roles', timestamps: true, underscored: true }
);
