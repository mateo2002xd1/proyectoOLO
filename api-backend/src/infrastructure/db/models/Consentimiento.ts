import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Consentimiento extends Model {
  declare id: string;
  declare politicaId: string;
  declare formulario: string;
  declare titularIdentificador: string;
  declare aceptado: boolean;
  declare aceptadoEn: Date;
  declare ip: string | null;
  declare userAgent: string | null;
}

// RF-13: la aceptación explícita que exige la Ley 1581 de 2012.
// `aceptado` solo admite `true` por CHECK: se registra la aceptación, nunca una
// casilla premarcada ni un rechazo (S7). La política se referencia por id — no se
// copia su texto — y con RESTRICT, porque una política con consentimientos tiene
// valor probatorio y no debe poder borrarse.
//
// Sin `timestamps`: la fecha que importa jurídicamente es `aceptado_en`, y tener
// además un `created_at` invitaría a preguntarse cuál de las dos vale.
Consentimiento.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    politicaId: { type: DataTypes.UUID, allowNull: false, field: 'politica_id' },
    formulario: { type: DataTypes.TEXT, allowNull: false },
    titularIdentificador: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'titular_identificador',
    },
    aceptado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    aceptadoEn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'aceptado_en',
    },
    ip: { type: DataTypes.INET },
    userAgent: { type: DataTypes.TEXT, field: 'user_agent' },
  },
  { sequelize, tableName: 'consentimientos', timestamps: false, underscored: true }
);
