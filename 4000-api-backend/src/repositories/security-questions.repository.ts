import { SecurityQuestion } from '../infrastructure/db/models';

export const SecurityQuestionRepository = {
  /** Las preguntas de seguridad de una cuenta, en el orden en que se configuraron. */
  findByUserId: (userId: string) =>
    SecurityQuestion.findAll({
      where: { user_id: userId },
      order: [['sort_order', 'ASC']],
    }),

  /** Cuántas preguntas de seguridad tiene configuradas una cuenta. */
  countByUserId: (userId: string) =>
    SecurityQuestion.count({ where: { user_id: userId } }),

  /** Borra todas las preguntas de seguridad de una cuenta. */
  deleteByUserId: (userId: string) =>
    SecurityQuestion.destroy({ where: { user_id: userId } }),

  /** Guarda de una vez varias preguntas de seguridad. */
  createBulk: (data: any[]) =>
    SecurityQuestion.bulkCreate(data),
};
