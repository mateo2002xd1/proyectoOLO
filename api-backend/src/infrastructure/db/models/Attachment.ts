import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Attachment extends Model {
  declare id: string;
  declare postId: string;
  declare fileName: string;
  declare filePath: string;
  declare mimeType: string;
  declare sizeBytes: number;
  declare createdAt: Date;
}

Attachment.init(
  {
    id: { type: DataTypes.TEXT, primaryKey: true },
    postId: { type: DataTypes.TEXT, allowNull: false },
    fileName: { type: DataTypes.TEXT, allowNull: false },
    filePath: { type: DataTypes.TEXT, allowNull: false },
    mimeType: { type: DataTypes.TEXT, allowNull: false },
    sizeBytes: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: 'Attachment', timestamps: true, freezeTableName: true }
);
