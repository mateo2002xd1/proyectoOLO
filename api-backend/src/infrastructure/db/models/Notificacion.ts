import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Notificacion extends Model {
  declare id: string;
  declare destinatarioId: string;
  declare tipo: string;
  declare entidadTipo: string;
  declare entidadId: string;
  declare datos: Record<string, unknown>;
  declare leidaEn: Date | null;
  declare createdAt: Date;
}

// Los avisos que se ven en el panel (T-06.6: notificar al editor cuando se rechaza).
//
// No copia el motivo del rechazo: guarda a qué entidad apunta y los parámetros del
// mensaje en `datos`. El texto se compone en el frontend a partir de `tipo`, así el
// motivo vive solo en `paginas_versiones.motivo_rechazo` y editarlo no deja una
// notificación mintiendo.
//
// `leida_en` es una fecha nullable y no un booleano: da el "cuándo" gratis.
Notificacion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    destinatarioId: { type: DataTypes.UUID, allowNull: false, field: 'destinatario_id' },
    tipo: { type: DataTypes.TEXT, allowNull: false },
    entidadTipo: { type: DataTypes.TEXT, allowNull: false, field: 'entidad_tipo' },
    entidadId: { type: DataTypes.UUID, allowNull: false, field: 'entidad_id' },
    datos: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    leidaEn: { type: DataTypes.DATE, field: 'leida_en' },
  },
  {
    sequelize,
    tableName: 'notificaciones',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);
