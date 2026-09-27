import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

/** Tabla `preguntas_seguridad`: las tres preguntas de cada cuenta, con la respuesta hasheada. */
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
    user_id: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
    question_key: { type: DataTypes.TEXT, allowNull: false, field: 'pregunta_clave' },
    answer_hash: { type: DataTypes.TEXT, allowNull: false, field: 'respuesta_hash' },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0, field: 'orden' },
  },
  { sequelize, tableName: 'preguntas_seguridad', timestamps: true, underscored: true }
);
