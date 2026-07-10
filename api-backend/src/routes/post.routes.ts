import { Router } from 'express';
import { PostController } from '../controllers/paginas.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/admin/global-lookup', PostController.globalLookup);
router.get('/', PostController.getAll);
router.get('/:id', PostController.getById);
router.post('/', PostController.create);
router.patch('/:id', PostController.update);
router.delete('/:id', PostController.delete);

export default router;
