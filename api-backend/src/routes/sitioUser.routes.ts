import { Router } from 'express';
import { SitioUserController } from '../controllers/sitio-users.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', SitioUserController.login);

router.use(requireAuth);
router.get('/', SitioUserController.getAll);
router.get('/:id', SitioUserController.getById);
router.post('/', SitioUserController.create);
router.patch('/:id', SitioUserController.update);
router.delete('/:id', SitioUserController.delete);

export default router;
