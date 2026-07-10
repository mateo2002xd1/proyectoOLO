import { Router } from 'express';
import { AuditController } from '../controllers/auditoria.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', AuditController.getAll);
router.get('/:contentType/:contentId', AuditController.getByContentId);

export default router;
