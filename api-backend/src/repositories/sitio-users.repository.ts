import { SitioUser } from '../infrastructure/db/models';

export const SitioUserRepository = {
  findAll: () =>
    SitioUser.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
    }),

  findById: (id: string) =>
    SitioUser.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    }),

  findByIdWithPassword: (id: string) => SitioUser.findByPk(id),

  findByEmail: (email: string) =>
    SitioUser.findOne({
      where: { email: email.trim().toLowerCase() },
    }),

  create: (data: any) => SitioUser.create(data),

  update: (id: string, data: any) =>
    SitioUser.update(data, { where: { id }, returning: true }),

  delete: (id: string) => SitioUser.destroy({ where: { id } }),

  updateLastLogin: (id: string) =>
    SitioUser.update({ last_login_at: new Date() }, { where: { id } }),
};
