import { Attachment } from '../infrastructure/db/models';

export const AttachmentRepository = {
  findByPost: (postId: string) =>
    Attachment.findAll({ where: { postId }, order: [['createdAt', 'ASC']] }),

  findById: (id: string) => Attachment.findByPk(id),

  create: (data: any) => Attachment.create(data),

  delete: (id: string) => Attachment.destroy({ where: { id } }),

  deleteByPost: (postId: string) => Attachment.destroy({ where: { postId } }),
};
