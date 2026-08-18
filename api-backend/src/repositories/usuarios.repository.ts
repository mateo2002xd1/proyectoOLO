import { User, Role } from '../infrastructure/db/models';
import { config } from '../config';
import { Op } from 'sequelize';

export const UserRepository = {
  findAll: () =>
    User.findAll({
      where: { email: { [Op.ne]: config.localAuth.email.toLowerCase() } },
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash'] },
    }),

  findById: (id: string) =>
    User.findByPk(id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash'] },
    }),

  findByIdWithPassword: (id: string) =>
    User.findByPk(id, { include: [{ model: Role, as: 'role' }] }),

  findByEmail: (email: string) =>
    User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }],
    }),

  /** Cuántas cuentas activas tiene un rol. Lo usa `updateUser` para no dejar el
   *  sistema sin ningún Superadmin al degradar al último que quedaba. */
  contarActivosPorRol: (role_id: string) =>
    User.count({ where: { role_id, status: 'active' } }),

  create: (data: any) => User.create(data),

  update: (id: string, data: any) =>
    User.update(data, { where: { id }, returning: true }),

  delete: (id: string) => User.destroy({ where: { id } }),

  updateLastAccess: (id: string) =>
    User.update({ last_access_at: new Date() }, { where: { id } }),
};
