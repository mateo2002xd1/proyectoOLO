import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Pagina extends Model {
  declare id: string;
  declare slug: string;
  declare titulo: string;
  declare versionPublicadaId: string | null;
  declare creadoPor: string;
  declare versionPublicada?: any;
  declare creador?: any;
  declare versiones?: any[];
}

Pagina.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    versionPublicadaId: { type: DataTypes.UUID, allowNull: true },
    creadoPor: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, tableName: 'paginas', timestamps: true, underscored: true }
);
