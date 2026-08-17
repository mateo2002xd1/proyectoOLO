import { Router } from 'express';
import { RolePermissionController } from '../controllers/role-permissions.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoUsuario } from '../middlewares/permisos.middleware';

const router = Router();

// Asignar y revocar permisos a roles. Es el endpoint que convierte cualquier cuenta en
// cualquier cosa, y hasta ahora bastaba con estar autenticado para llamarlo.
router.use(requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'));

router.get('/', RolePermissionController.getAll);
router.get('/role/:roleId', RolePermissionController.getByRole);
router.post('/', RolePermissionController.assign);
router.delete('/', RolePermissionController.revoke);

export default router;
