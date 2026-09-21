import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export type EntidadAuditable =
  | 'contenido'
  | 'pagina'
  | 'seccion'
  | 'usuario'
  | 'rol'
  | 'marca'
  | 'configuracion'
  | 'archivo';

export type AccionAuditable =
  | 'crear'
  | 'actualizar'
  | 'eliminar'
  | 'publicar'
  | 'despublicar'
  | 'aprobar'
  | 'rechazar'
  | 'enviar_revision'
  | 'guardar_borrador'
  // Se distingue de 'actualizar' a propósito: la Ley 1581 obliga a poder responder
  // «quién cambió contraseñas y cuándo» sin separarlo a mano del resto de ediciones.
  | 'cambiar_password'
  // Seguridad y administración (migración 030): antes de esto ninguna de las tres
  // dejaba rastro — el login no se auditaba, y una cuenta caducada o inactivada a
  // mano se confundía con cualquier otro `actualizar`.
  | 'autenticar'
  | 'expirar'
  | 'inactivar';

export class ContentAuditLog extends Model {
  declare id: string;
  declare entidad_id: string;
  declare entidad_tipo: EntidadAuditable;
  declare usuario_id: string | null;
  declare usuario_nombre: string | null;
  declare accion: AccionAuditable;
  declare campos_modificados: { campo: string; antes: unknown; despues: unknown }[];
  declare ip: string | null;
  declare user_agent: string | null;
  declare created_at: Date;
}

// La bitácora de RF-07. A diferencia del resto de modelos, aquí los atributos sí se
// alinearon al dominio: ningún frontend consume todavía estos campos, así que no había
// contrato que preservar.
//
// Sin `updated_at` a propósito: una entrada de auditoría que se puede modificar no
// sirve como evidencia. Y `usuario_nombre` se guarda junto al id — es la única
// desnormalización del esquema, para que el registro siga siendo legible si el
// usuario se borra.
ContentAuditLog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    entidad_id: { type: DataTypes.UUID, allowNull: false },
    entidad_tipo: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'contenido' },
    usuario_id: { type: DataTypes.UUID },
    usuario_nombre: { type: DataTypes.TEXT },
    accion: { type: DataTypes.TEXT, allowNull: false },
    campos_modificados: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    ip: { type: DataTypes.INET },
    user_agent: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    tableName: 'auditoria_cambios',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);
