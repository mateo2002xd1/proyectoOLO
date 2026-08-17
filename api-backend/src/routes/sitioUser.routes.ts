import { Router } from 'express';
import { SitioUserController } from '../controllers/sitio-users.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoUsuario } from '../middlewares/permisos.middleware';

const router = Router();

router.post('/login', SitioUserController.login);

/**
 * Los usuarios del sitio público los administra la intranet, no ellos mismos.
 *
 * No hay excepción por cuenta propia como en `/api/users`: un `SitioUser` inicia
 * sesión con `jwtSiteSecret` y su token no pasa `requireAuth`, que verifica con
 * `jwtSecret`. Quien llega aquí es siempre personal interno.
 *
 * Estas filas son datos personales de ciudadanos (Ley 1581) y estaban expuestas a
 * cualquier sesión interna, incluido el listado completo.
 */
router.use(requireAuth, requierePermisoUsuario('puedeAdministrarUsuarios'));

router.get('/', SitioUserController.getAll);
router.get('/:id', SitioUserController.getById);
router.post('/', SitioUserController.create);
router.patch('/:id', SitioUserController.update);
router.delete('/:id', SitioUserController.delete);

export default router;
