import { Router } from 'express';
import { ContenidoController } from '../controllers/contenido.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { cacheInterceptor } from '../middlewares/cache.middleware';
import { requierePermisoContenido } from '../middlewares/permisos.middleware';

const router = Router();

// Público (RF-10, RF-12) — debe ir antes del requireAuth
router.get('/publica', cacheInterceptor(300), ContenidoController.listarPublicados);

router.use(requireAuth);

// El buscador del panel atraviesa título, cuerpo y resumen de **todo** el contenido,
// publicado o no, y devuelve además el autor de cada resultado. Es el mismo alcance
// que `puedeVerNoPublicado`, así que exige lo mismo.
router.get(
  '/admin/global-lookup',
  requierePermisoContenido('puedeVerNoPublicado'),
  ContenidoController.globalLookup
);
router.get('/', ContenidoController.getAll);

// `getById` filtra por sí mismo lo no publicado: quien no es el autor ni tiene
// `puedeVerNoPublicado` recibe 404 aunque el id exista. Esa decisión necesita la fila
// delante, así que la toma el caso de uso y no un middleware.
router.get('/:id', ContenidoController.getById);

router.post('/', requierePermisoContenido('puedeEditar'), ContenidoController.create);
router.patch('/:id', requierePermisoContenido('puedeEditar'), ContenidoController.update);

// Borrar sí mira al autor: `puedeEditar` deja pasar a cualquier Editor —la edición es
// colaborativa— pero destruir lo de otro queda para quien aprueba. El caso de uso
// completa la excepción del autor sobre lo suyo.
router.delete('/:id', requierePermisoContenido('puedeEditar'), ContenidoController.delete);

export default router;
