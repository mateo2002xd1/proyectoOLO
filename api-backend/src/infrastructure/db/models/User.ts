import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class User extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare password_hash: string;
  declare role_id: string;
  declare status: string;
  declare expiration_date: Date | null;
  declare last_access_at: Date | null;
  declare must_setup_security_questions: boolean;
  declare must_change_password: boolean;
  declare failed_security_attempts: number;
  declare locked_until: Date | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare role?: any;
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false },
    email: { type: DataTypes.TEXT, allowNull: false, unique: true },
    password_hash: { type: DataTypes.TEXT },
    role_id: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'active' },
    expiration_date: { type: DataTypes.DATE },
    last_access_at: { type: DataTypes.DATE },
    must_setup_security_questions: { type: DataTypes.BOOLEAN, defaultValue: true },
    must_change_password: { type: DataTypes.BOOLEAN, defaultValue: false },
    failed_security_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    locked_until: { type: DataTypes.DATE },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['role_id'] },
      { fields: ['status'] }
    ]
  }
);
