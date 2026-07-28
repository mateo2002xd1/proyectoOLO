import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class AuditoriaAcceso extends Model {
  declare id: string;
  declare usuarioId: string | null;
  declare recursoTipo: 'archivo' | 'pagina_interna' | 'tablero';
  declare recursoId: string;
  declare accion: 'ver' | 'descargar';
  declare ip: string | null;
  declare userAgent: string | null;
  declare createdAt: Date;
}

// Quién vio o descargó qué (T-15.6 para la información estratégica de directores,
// y las descargas públicas de RF-12).
//
// Separada de `auditoria_cambios` a propósito: un acceso y un cambio tienen distinto
// volumen, distinta retención y distintas columnas. Juntarlas dejaría media tabla en
// NULL en cada fila.
//
// `usuario_id` nulo significa descarga pública anónima, que es lo normal en RF-12.
AuditoriaAcceso.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    usuarioId: { type: DataTypes.UUID, field: 'usuario_id' },
    recursoTipo: { type: DataTypes.TEXT, allowNull: false, field: 'recurso_tipo' },
    recursoId: { type: DataTypes.UUID, allowNull: false, field: 'recurso_id' },
    accion: { type: DataTypes.TEXT, allowNull: false },
    ip: { type: DataTypes.INET },
    userAgent: { type: DataTypes.TEXT, field: 'user_agent' },
  },
  {
    sequelize,
    tableName: 'auditoria_accesos',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);
