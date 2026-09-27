import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

/** Tabla `roles_permisos`: qué permisos tiene cada rol. */
export class RolePermission extends Model {
  declare role_id: string;
  declare permission_id: string;
}

// Sin `id` propio: la pareja rol-permiso es la identidad de la fila.
RolePermission.init(
  {
    role_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, field: 'rol_id' },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: 'permiso_id',
    },
  },
  { sequelize, tableName: 'roles_permisos', timestamps: false }
);
