import { SecurityQuestion } from '../infrastructure/db/models';

export const SecurityQuestionRepository = {
  findByUserId: (userId: string) =>
    SecurityQuestion.findAll({
      where: { user_id: userId },
      order: [['sort_order', 'ASC']],
    }),

  deleteByUserId: (userId: string) =>
    SecurityQuestion.destroy({ where: { user_id: userId } }),

  createBulk: (data: any[]) =>
    SecurityQuestion.bulkCreate(data),
};
