import { Permission } from '../infrastructure/db/models';

export const PermissionRepository = {
  findAll: () => Permission.findAll(),

  findById: (id: string) => Permission.findByPk(id),

  findByName: (name: string) => Permission.findOne({ where: { name } }),

  create: (data: any) => Permission.create(data),

  update: (id: string, data: any) =>
    Permission.update(data, { where: { id }, returning: true }),

  delete: (id: string) => Permission.destroy({ where: { id } }),
};
