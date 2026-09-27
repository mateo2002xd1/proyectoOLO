import { Role, Permission } from '../infrastructure/db/models';
import { Op } from 'sequelize';

export const RoleRepository = {
  /** Los roles con sus permisos, sin Superadmin (no se administra desde el panel). */
  findAll: () =>
    Role.findAll({ 
      where: { name: { [Op.ne]: 'Superadmin' } },
      include: [{ model: Permission, as: 'permissions' }] 
    }),

  /** Un rol por su id, con sus permisos. */
  findById: (id: string) =>
    Role.findByPk(id, { include: [{ model: Permission, as: 'permissions' }] }),

  /** Un rol por su nombre exacto, o `null`. */
  findByName: (name: string) => Role.findOne({ where: { name } }),

  /** Crea un rol. */
  create: (data: any) => Role.create(data),

  /** Actualiza un rol y devuelve las filas cambiadas. */
  update: (id: string, data: any) =>
    Role.update(data, { where: { id }, returning: true }),

  /** Borra un rol. */
  delete: (id: string) => Role.destroy({ where: { id } }),
};
