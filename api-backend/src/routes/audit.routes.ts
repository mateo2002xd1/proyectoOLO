import { Router } from 'express';
import { AuditController } from '../controllers/auditoria.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoAuditoria } from '../middlewares/permisos.middleware';
import { requirePermission } from '../middlewares/require-permission.middleware';

const router = Router();

/**
 * Consulta de la bitácora (RF-07).
 *
 * `requireAuth` sola NO basta aquí, aunque durante un tiempo fue lo único que
 * había: la respuesta incluye la IP y el user-agent de cada editor, así que con
 * solo exigir sesión cualquier usuario autenticado —un `visitante_interno`
 * incluido— podía leer el rastro completo de todos sus compañeros.
 *
 * El filtro va en el router y no en el controlador para que ninguna ruta nueva
 * pueda añadirse aquí por descuido sin pasar por él.
 */
router.use(requireAuth, requierePermisoAuditoria('puedeVer'), requirePermission('auditoria.ver'));

router.get('/', AuditController.getAll);
router.get('/:contentType/:contentId', AuditController.getByContentId);

export default router;
