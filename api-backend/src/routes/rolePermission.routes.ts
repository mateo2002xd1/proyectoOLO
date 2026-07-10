import { Router } from 'express';
import { RolePermissionController } from '../controllers/role-permissions.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', RolePermissionController.getAll);
router.get('/role/:roleId', RolePermissionController.getByRole);
router.post('/', RolePermissionController.assign);
router.delete('/', RolePermissionController.revoke);

export default router;
