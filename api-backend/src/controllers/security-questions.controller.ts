import { Request, Response, NextFunction } from 'express';
import {
  getCatalog,
  getQuestionKeysForUser,
  setupQuestions,
  verifyAnswers,
  recoverPassword,
} from '../use-cases/auth/security-questions.usecase';

export const SecurityQuestionController = {
  getCatalog(_req: Request, res: Response) {
    res.json(getCatalog());
  },

  async getQuestionKeysForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'El correo es obligatorio' });
      const questions = await getQuestionKeysForUser(email);
      res.json({ questions });
    } catch (err: any) {
      if (err.status === 404) return res.json({ questions: [] });
      next(err);
    }
  },

  async setupQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'No autorizado' });
      if (req.user?.isLocal) return res.status(403).json({ error: 'El usuario local no puede configurar preguntas' });
      res.json(await setupQuestions(userId, req.body.questions));
    } catch (err) { next(err); }
  },

  async verifyAnswersCtrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, answers } = req.body;
      await verifyAnswers(email, answers);
      res.json({ message: 'Respuestas correctas' });
    } catch (err) { next(err); }
  },

  async recoverPasswordCtrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, answers, newPassword } = req.body;
      res.json(await recoverPassword(email, answers, newPassword));
    } catch (err: any) {
      if (err.status === 423) return res.status(423).json({ error: err.message });
      const safeMessage = 'No fue posible recuperar la contraseña. Verifica los datos e intenta de nuevo.';
      const status = (err.status === 400 || err.status === 401 || err.status === 404) ? 401 : 500;
      res.status(status).json({ error: safeMessage });
    }
  },
};
