import { Router } from 'express';
import { ContenidoController } from '../controllers/contenido.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { cacheInterceptor } from '../middlewares/cache.middleware';

const router = Router();

// Público (RF-10, RF-12) — debe ir antes del requireAuth
router.get('/publica', cacheInterceptor(300), ContenidoController.listarPublicados);

router.use(requireAuth);

router.get('/admin/global-lookup', ContenidoController.globalLookup);
router.get('/', ContenidoController.getAll);
router.get('/:id', ContenidoController.getById);
router.post('/', ContenidoController.create);
router.patch('/:id', ContenidoController.update);
router.delete('/:id', ContenidoController.delete);

export default router;
