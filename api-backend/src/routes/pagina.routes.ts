import { Router } from 'express';
import { PaginaController } from '../controllers/pagina.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/publica/:slug', PaginaController.obtenerPublica);

router.use(requireAuth);

router.post('/:slug/borrador', PaginaController.guardarBorrador);
router.patch('/:slug/enviar-revision', PaginaController.enviarARevision);
router.patch('/:slug/aprobar', PaginaController.aprobar);
router.patch('/:slug/rechazar', PaginaController.rechazar);
router.get('/en-revision', PaginaController.listarEnRevision);

export default router;
