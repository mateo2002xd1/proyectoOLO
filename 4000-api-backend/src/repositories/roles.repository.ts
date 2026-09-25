import { Role, Permission } from '../infrastructure/db/models';
import { Op } from 'sequelize';

export const RoleRepository = {
  findAll: () =>
    Role.findAll({ 
      where: { name: { [Op.ne]: 'Superadmin' } },
      include: [{ model: Permission, as: 'permissions' }] 
    }),

  findById: (id: string) =>
    Role.findByPk(id, { include: [{ model: Permission, as: 'permissions' }] }),

  findByName: (name: string) => Role.findOne({ where: { name } }),

  create: (data: any) => Role.create(data),

  update: (id: string, data: any) =>
    Role.update(data, { where: { id }, returning: true }),

  delete: (id: string) => Role.destroy({ where: { id } }),
};
