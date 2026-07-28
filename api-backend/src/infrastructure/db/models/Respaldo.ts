import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Respaldo extends Model {
  declare id: string;
  declare disparadoPor: 'programado' | 'manual';
  declare usuarioId: string | null;
  declare iniciadoEn: Date;
  declare terminadoEn: Date | null;
  declare estado: 'en_curso' | 'exitoso' | 'fallido';
  declare destino: string | null;
  declare tamanoBytes: number | null;
  declare checksumSha256: string | null;
  declare cifrado: boolean;
  declare retencionHasta: Date | null;
  declare error: string | null;
}

// RF-17: el historial de ejecuciones (T-17.5). La cola vive en BullMQ; aquí solo
// queda el registro de qué pasó.
// `cifrado` por defecto en true (S9: el respaldo contiene la base completa) y
// `retencion_hasta` es lo que consulta la rotación de T-17.8. Un respaldo fallido
// siempre trae `error`, por CHECK.
//
// Sin `timestamps`: `iniciado_en` y `terminado_en` ya describen la vida de la fila.
Respaldo.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    disparadoPor: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'programado',
      field: 'disparado_por',
    },
    usuarioId: { type: DataTypes.UUID, field: 'usuario_id' },
    iniciadoEn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'iniciado_en',
    },
    terminadoEn: { type: DataTypes.DATE, field: 'terminado_en' },
    estado: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'en_curso' },
    destino: { type: DataTypes.TEXT },
    tamanoBytes: { type: DataTypes.BIGINT, field: 'tamano_bytes' },
    checksumSha256: { type: DataTypes.CHAR(64), field: 'checksum_sha256' },
    cifrado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    retencionHasta: { type: DataTypes.DATE, field: 'retencion_hasta' },
    error: { type: DataTypes.TEXT },
  },
  { sequelize, tableName: 'respaldos', timestamps: false, underscored: true }
);
