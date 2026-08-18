import { Router } from 'express';
import { RolePermissionController } from '../controllers/role-permissions.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoUsuario } from '../middlewares/permisos.middleware';
import { requirePermission } from '../middlewares/require-permission.middleware';

const router = Router();

// Asignar y revocar permisos a roles. Es el endpoint que convierte cualquier cuenta en
// cualquier cosa, y hasta ahora bastaba con estar autenticado para llamarlo.
// Dos capas: el rol decide quién entra al panel de seguridad, el permiso del
// catálogo decide si esta persona en concreto puede tocarlo.
router.use(
  requireAuth,
  requierePermisoUsuario('puedeAdministrarSeguridad'),
  requirePermission('usuarios.permisos')
);

router.get('/', RolePermissionController.getAll);
router.get('/role/:roleId', RolePermissionController.getByRole);
router.post('/', RolePermissionController.assign);
router.delete('/', RolePermissionController.revoke);

export default router;
