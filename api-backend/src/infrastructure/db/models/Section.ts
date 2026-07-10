import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Section extends Model {
  declare id: string;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Section.init(
  {
    id: { type: DataTypes.TEXT, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false, unique: true },
    slug: { type: DataTypes.TEXT, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
  },
  { sequelize, tableName: 'Section', timestamps: true, freezeTableName: true }
);
