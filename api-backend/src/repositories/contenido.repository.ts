import { Op } from 'sequelize';
import { Contenido, Section, Archivo, User } from '../infrastructure/db/models';

export const ContenidoRepository = {
  findAll: (where: any = {}) =>
    Contenido.findAll({
      where,
      include: [{ model: Section, as: 'section' }],
      order: [['createdAt', 'DESC']],
    }),

  findById: (id: string) =>
    Contenido.findByPk(id, {
      include: [
        { model: Section, as: 'section' },
        { model: Archivo, as: 'attachments', through: { attributes: [] } },
      ],
    }),

  findBySlug: (slug: string) =>
    Contenido.findOne({
      where: { slug },
      include: [{ model: Section, as: 'section' }],
    }),

  globalLookup: (term: string) => {
    const normalized = `%${term}%`;
    return Contenido.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: normalized } },
          { content: { [Op.iLike]: normalized } },
          { excerpt: { [Op.iLike]: normalized } },
        ],
      },
      include: [
        { model: Section, as: 'section', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
      ],
      limit: 20,
      order: [['createdAt', 'DESC']],
    });
  },

  create: (data: any) => Contenido.create(data),

  update: (id: string, data: any) =>
    Contenido.update(data, { where: { id }, returning: true }),

  delete: (id: string) => Contenido.destroy({ where: { id } }),
};
