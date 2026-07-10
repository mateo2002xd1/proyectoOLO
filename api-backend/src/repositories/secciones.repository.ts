import { Section } from '../infrastructure/db/models';

export const SectionRepository = {
  findAll: () => Section.findAll(),

  findById: (id: string) => Section.findByPk(id),

  findBySlug: (slug: string) => Section.findOne({ where: { slug } }),

  create: (data: any) => Section.create(data),

  update: (id: string, data: any) =>
    Section.update(data, { where: { id }, returning: true }),

  delete: (id: string) => Section.destroy({ where: { id } }),
};
