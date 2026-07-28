import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Permission extends Model {
  declare id: string;
  declare name: string;
  declare created_at: Date;
  declare updated_at: Date;
}

Permission.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    // La columna es `clave`: es el identificador estable que compara el código
    // (`paginas.aprobar`, `acceso.intranet`), no una etiqueta que se traduzca.
    name: { type: DataTypes.TEXT, allowNull: false, unique: true, field: 'clave' },
  },
  { sequelize, tableName: 'permisos', timestamps: true, underscored: true }
);
