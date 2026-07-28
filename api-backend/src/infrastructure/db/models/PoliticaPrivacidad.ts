import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class PoliticaPrivacidad extends Model {
  declare id: string;
  declare version: string;
  declare titulo: string;
  declare cuerpo: string;
  declare url: string | null;
  declare vigenteDesde: Date;
  declare vigenteHasta: Date | null;
  declare createdAt: Date;
}

// RF-13 / Ley 1581 de 2012. Cada versión del aviso de privacidad se conserva: para
// demostrar qué aceptó un titular hay que poder mostrar el texto exacto de entonces.
// Solo una puede estar vigente (`vigente_hasta IS NULL`), y lo impone un índice
// único parcial (invariante I8).
PoliticaPrivacidad.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    version: { type: DataTypes.TEXT, allowNull: false, unique: true },
    titulo: { type: DataTypes.TEXT, allowNull: false },
    cuerpo: { type: DataTypes.TEXT, allowNull: false },
    url: { type: DataTypes.TEXT },
    vigenteDesde: { type: DataTypes.DATE, allowNull: false, field: 'vigente_desde' },
    vigenteHasta: { type: DataTypes.DATE, field: 'vigente_hasta' },
  },
  {
    sequelize,
    tableName: 'politicas_privacidad',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);
