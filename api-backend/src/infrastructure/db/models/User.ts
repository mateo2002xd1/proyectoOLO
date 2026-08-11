import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class User extends Model {
  declare id: string;
  declare name: string;
  declare apellidos: string;
  declare email: string;
  declare password_hash: string;
  declare role_id: string;
  declare status: string;
  declare expiration_date: Date | null;
  declare last_access_at: Date | null;
  declare must_setup_security_questions: boolean;
  declare must_change_password: boolean;
  declare failed_security_attempts: number;
  declare failed_login_attempts: number;
  declare locked_until: Date | null;
  declare created_by: string | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare role?: any;
}

// Atributos en inglés porque son el contrato que consume el panel de usuarios;
// columnas en español porque es la convención de la base. `field` une las dos.
User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false, field: 'nombre' },
    apellidos: { type: DataTypes.TEXT, allowNull: true },
    email: { type: DataTypes.TEXT, allowNull: false, unique: true },
    password_hash: { type: DataTypes.TEXT },
    role_id: { type: DataTypes.UUID, allowNull: false, field: 'rol_id' },
    status: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'active', field: 'estado' },
    // NULL significa "sin caducidad", y es lo que RF-16 reserva al administrador.
    expiration_date: { type: DataTypes.DATE, field: 'fecha_caducidad' },
    last_access_at: { type: DataTypes.DATE, field: 'ultimo_acceso_en' },
    must_setup_security_questions: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'debe_configurar_preguntas',
    },
    must_change_password: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'debe_cambiar_password',
    },
    // Cuenta los fallos de las *preguntas de seguridad* (3 intentos, 30 min). El
    // login lleva el suyo aparte porque §3 le pide otro umbral.
    failed_security_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'intentos_fallidos',
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'intentos_fallidos_login',
    },
    locked_until: { type: DataTypes.DATE, field: 'bloqueado_hasta' },
    created_by: { type: DataTypes.UUID, field: 'creado_por' },
  },
  { sequelize, tableName: 'usuarios', timestamps: true, underscored: true }
);
