import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Post extends Model {
  declare id: string;
  declare title: string;
  declare slug: string;
  declare excerpt: string | null;
  declare content: string;
  declare sectionId: string;
  declare authorId: string | null;
  declare publishedAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare section?: any;
  declare attachments?: any[];
}

Post.init(
  {
    id: { type: DataTypes.TEXT, primaryKey: true },
    title: { type: DataTypes.TEXT, allowNull: false },
    slug: { type: DataTypes.TEXT, allowNull: false, unique: true },
    excerpt: { type: DataTypes.TEXT },
    content: { type: DataTypes.TEXT, allowNull: false },
    sectionId: { type: DataTypes.TEXT, allowNull: false },
    authorId: { type: DataTypes.TEXT },
    publishedAt: { type: DataTypes.DATE },
  },
  {
    sequelize,
    tableName: 'Post',
    timestamps: true,
    freezeTableName: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['sectionId'] },
      { fields: ['authorId'] },
      { fields: ['publishedAt'] }
    ]
  }
);
