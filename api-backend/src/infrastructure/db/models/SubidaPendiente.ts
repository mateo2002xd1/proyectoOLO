import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

/** Un archivo subido para una página que aún no se ha publicado. Ver `024-subidas-pendientes`. */
export class SubidaPendiente extends Model {
  declare paginaId: string;
  declare ruta: string;
  declare creadoEn: Date;
}

SubidaPendiente.init(
  {
    paginaId: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    ruta: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
    creadoEn: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'subidas_pendientes', timestamps: false, underscored: true }
);
