import { Router } from 'express';
import { PermissionController } from '../controllers/permisos.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoUsuario } from '../middlewares/permisos.middleware';
import { requirePermission } from '../middlewares/require-permission.middleware';

const router = Router();

// El catálogo de permisos es la definición de qué se puede conceder. Estaba abierto a
// cualquier sesión, incluido el `POST`: se podía inventar un permiso y asignárselo
// acto seguido por `/api/role-permissions`, que también estaba abierto.
// Dos capas: el rol decide quién entra al panel de seguridad, el permiso del
// catálogo decide si esta persona en concreto puede tocarlo.
router.use(
  requireAuth,
  requierePermisoUsuario('puedeAdministrarSeguridad'),
  requirePermission('usuarios.permisos')
);

router.get('/', PermissionController.getAll);
router.get('/:id', PermissionController.getById);
router.post('/', PermissionController.create);
router.patch('/:id', PermissionController.update);
router.delete('/:id', PermissionController.delete);

export default router;
