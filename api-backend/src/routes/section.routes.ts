import { Router } from 'express';
import { SectionController } from '../controllers/secciones.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', SectionController.getAll);
router.get('/:id', SectionController.getById);
router.post('/', SectionController.create);
router.patch('/:id', SectionController.update);
router.delete('/:id', SectionController.delete);

export default router;
