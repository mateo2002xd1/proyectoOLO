import { SecurityQuestion } from '../infrastructure/db/models';

export const SecurityQuestionRepository = {
  /** Las preguntas de seguridad de una cuenta, en el orden en que se configuraron. */
  findByUserId: (userId: string) =>
    SecurityQuestion.findAll({
      where: { user_id: userId },
      order: [['sort_order', 'ASC']],
    }),

  /** Borra todas las preguntas de seguridad de una cuenta. */
  deleteByUserId: (userId: string) =>
    SecurityQuestion.destroy({ where: { user_id: userId } }),

  /** Guarda de una vez varias preguntas de seguridad. */
  createBulk: (data: any[]) =>
    SecurityQuestion.bulkCreate(data),
};
