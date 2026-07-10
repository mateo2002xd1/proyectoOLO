import { Router } from 'express';
import { RoleController } from '../controllers/roles.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', RoleController.getAll);
router.get('/:id', RoleController.getById);
router.post('/', RoleController.create);
router.patch('/:id', RoleController.update);
router.delete('/:id', RoleController.delete);

export default router;
