import { Router } from 'express';
import { ContenidoController } from '../controllers/contenido.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/admin/global-lookup', ContenidoController.globalLookup);
router.get('/', ContenidoController.getAll);
router.get('/:id', ContenidoController.getById);
router.post('/', ContenidoController.create);
router.patch('/:id', ContenidoController.update);
router.delete('/:id', ContenidoController.delete);

export default router;
