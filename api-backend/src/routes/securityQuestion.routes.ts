import { Router } from 'express';
import { SecurityQuestionController } from '../controllers/security-questions.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  limitadorDePreguntas,
  limitadorDeVerificacion,
  limitadorDeRecuperacion,
} from '../middlewares/rate-limit.middleware';

const router = Router();

/**
 * Los tres pasos de la recuperación cuentan por **correo**.
 *
 * `recover-password` ya lo hacía y era el único límite de la API que funcionaba de
 * verdad; los otros dos contaban por IP, así que cinco peticiones bastaban para dejar
 * sin recuperación de contraseña a toda la institución durante quince minutos. Ahora
 * los tres usan la misma clave, que además es la unidad que tiene sentido proteger:
 * las respuestas de seguridad se adivinan cuenta por cuenta.
 */
router.get('/catalog', SecurityQuestionController.getCatalog);
router.post('/user-questions', limitadorDePreguntas, SecurityQuestionController.getQuestionKeysForUser);
router.post('/setup', requireAuth, SecurityQuestionController.setupQuestions);
router.post('/verify', limitadorDeVerificacion, SecurityQuestionController.verifyAnswersCtrl);
router.post('/recover-password', limitadorDeRecuperacion, SecurityQuestionController.recoverPasswordCtrl);

export default router;
