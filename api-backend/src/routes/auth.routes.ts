import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { limitadorDeLogin, limitadorDeLogout } from '../middlewares/rate-limit.middleware';

const router = Router();

/**
 * El límite del login cuenta por **correo**, no por IP.
 *
 * Contar por IP tenía dos fallos a la vez: no frenaba a quien rota direcciones, y
 * dejaba que un solo atacante agotara el cupo compartido y bloqueara el acceso a todo
 * el mundo. Por correo, atacar una cuenta solo penaliza a esa cuenta.
 *
 * Sigue siendo el segundo de dos controles: el bloqueo tras cinco intentos fallidos
 * (`registrarFalloDeLogin`) protege la cuenta contra quien acierta el correo, y este
 * protege a la API contra el volumen. Uno no sustituye al otro.
 */
router.post('/login', limitadorDeLogin, AuthController.login);
router.get('/first-login/status', requireAuth, AuthController.firstLoginStatus);
router.post('/first-login', requireAuth, AuthController.firstLogin);
router.post('/logout', limitadorDeLogout, AuthController.logout);
router.get('/me', requireAuth, AuthController.me);
router.post('/change-password', requireAuth, AuthController.changePassword);

export default router;
