import { Router } from 'express';
import { SectionController } from '../controllers/secciones.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoContenido } from '../middlewares/permisos.middleware';

const router = Router();
router.use(requireAuth);

// Leer la taxonomía la necesita cualquiera que edite: el selector de sección del
// editor la consulta para poder clasificar lo que escribe.
router.get('/', SectionController.getAll);
router.get('/:id', SectionController.getById);

// Cambiarla reordena el portal entero, así que no basta con poder editar contenido.
router.post('/', requierePermisoContenido('puedeAdministrarSecciones'), SectionController.create);
router.patch('/:id', requierePermisoContenido('puedeAdministrarSecciones'), SectionController.update);
router.delete('/:id', requierePermisoContenido('puedeAdministrarSecciones'), SectionController.delete);

export default router;
