import { Permission } from '../infrastructure/db/models';

/** Acceso a la tabla `permisos`: solo lectura; las altas y bajas las hacen el sembrador y las secciones. */
export const PermissionRepository = {
  /** Todas las filas de `permisos`, sin orden: el orden lo pone el catálogo. */
  findAll: () => Permission.findAll(),

  /** Un permiso por su id, o `null` si no existe. */
  findById: (id: string) => Permission.findByPk(id),
};
