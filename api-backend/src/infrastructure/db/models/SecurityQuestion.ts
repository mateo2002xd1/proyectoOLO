import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class SecurityQuestion extends Model {
  declare id: string;
  declare user_id: string;
  declare question_key: string;
  declare answer_hash: string;
  declare sort_order: number;
  declare created_at: Date;
  declare updated_at: Date;
}

SecurityQuestion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    question_key: { type: DataTypes.TEXT, allowNull: false },
    answer_hash: { type: DataTypes.TEXT, allowNull: false },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'security_questions',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['user_id', 'question_key'] }],
  }
);
