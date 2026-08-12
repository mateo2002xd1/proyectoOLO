import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de inicio de sesión. Intente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const logoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes. Intente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/login', loginLimiter, AuthController.login);
router.get('/first-login/status', requireAuth, AuthController.firstLoginStatus);
router.post('/first-login', requireAuth, AuthController.firstLogin);
router.post('/logout', logoutLimiter, AuthController.logout);
router.get('/me', requireAuth, AuthController.me);
router.post('/change-password', requireAuth, AuthController.changePassword);

export default router;
