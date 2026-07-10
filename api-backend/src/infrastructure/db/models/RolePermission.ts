import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class RolePermission extends Model {
  declare role_id: string;
  declare permission_id: string;
}

RolePermission.init(
  {
    role_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    permission_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  },
  { sequelize, tableName: 'role_permissions', timestamps: false }
);
