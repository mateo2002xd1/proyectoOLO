import { Router } from 'express';
import { PermissionController } from '../controllers/permisos.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', PermissionController.getAll);
router.get('/:id', PermissionController.getById);
router.post('/', PermissionController.create);
router.patch('/:id', PermissionController.update);
router.delete('/:id', PermissionController.delete);

export default router;
