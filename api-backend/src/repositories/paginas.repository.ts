import { Op } from 'sequelize';
import { Post, Section, Attachment, User } from '../infrastructure/db/models';

export const PostRepository = {
  findAll: (where: any = {}) =>
    Post.findAll({
      where,
      include: [{ model: Section, as: 'section' }],
      order: [['createdAt', 'DESC']],
    }),

  findById: (id: string) =>
    Post.findByPk(id, {
      include: [
        { model: Section, as: 'section' },
        { model: Attachment, as: 'attachments' },
      ],
    }),

  findBySlug: (slug: string) =>
    Post.findOne({
      where: { slug },
      include: [{ model: Section, as: 'section' }],
    }),

  globalLookup: (term: string) => {
    const normalized = `%${term}%`;
    return Post.findAll({
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

  create: (data: any) => Post.create(data),

  update: (id: string, data: any) =>
    Post.update(data, { where: { id }, returning: true }),

  delete: (id: string) => Post.destroy({ where: { id } }),
};
