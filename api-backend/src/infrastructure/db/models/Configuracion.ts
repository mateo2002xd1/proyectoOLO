import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Configuracion extends Model {
  declare clave: string;
  declare valor: unknown;
  declare descripcion: string | null;
  declare actualizadoPor: string | null;
  declare updatedAt: Date;
}

// Ajustes escalares del sistema: tamaño máximo de archivo (RF-02), dominios de
// iframe permitidos (RF-08), frecuencia de respaldo (RF-17).
// La clave es la primaria: un id sintético sería una columna que nadie consulta.
Configuracion.init(
  {
    clave: { type: DataTypes.TEXT, primaryKey: true },
    valor: { type: DataTypes.JSONB, allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    actualizadoPor: { type: DataTypes.UUID, field: 'actualizado_por' },
  },
  {
    sequelize,
    tableName: 'configuraciones',
    timestamps: true,
    createdAt: false,
    underscored: true,
  }
);
