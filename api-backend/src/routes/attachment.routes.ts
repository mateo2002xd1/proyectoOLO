import { Router } from 'express';
import { AttachmentController } from '../controllers/adjuntos.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', AttachmentController.getByPost);
router.post('/', AttachmentController.create);

export default router;
