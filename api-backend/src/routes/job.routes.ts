import { Router } from 'express';
import { TrabajosController } from '../controllers/trabajos.controller';

const router = Router();

router.get('/:id', TrabajosController.consultarEstado);
router.post('/start-heavy-task', TrabajosController.encolarTarea);

export default router;
