import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { SecurityQuestionController } from '../controllers/security-questions.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

const userQuestionsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiadas solicitudes. Intente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiadas solicitudes. Intente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const recoverPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Demasiados intentos de recuperación. Intente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    const email = req.body?.email?.trim().toLowerCase() || 'unknown';
    return `recover:${email}`;
  },
});

router.get('/catalog', SecurityQuestionController.getCatalog);
router.post('/user-questions', userQuestionsLimiter, SecurityQuestionController.getQuestionKeysForUser);
router.post('/setup', requireAuth, SecurityQuestionController.setupQuestions);
router.post('/verify', verifyLimiter, SecurityQuestionController.verifyAnswersCtrl);
router.post('/recover-password', recoverPasswordLimiter, SecurityQuestionController.recoverPasswordCtrl);

export default router;
