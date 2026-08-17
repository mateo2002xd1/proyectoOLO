import { Router } from 'express';
import { AttachmentController } from '../controllers/adjuntos.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoContenido } from '../middlewares/permisos.middleware';

// `mergeParams` es lo que deja ver `:contenidoId` del prefijo con el que `app.ts`
// monta este router. Sin él, el padre de la URL no llegaría hasta aquí y no habría
// contra qué comprobar la pertenencia.
const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', AttachmentController.getByPost);
router.post('/', requierePermisoContenido('puedeEditar'), AttachmentController.create);

/**
 * Borrar un adjunto **del contenido que dice la URL**.
 *
 * Antes esto vivía suelto en `app.ts` como `DELETE /api/attachments/:id`, sin padre
 * contra el que comparar: cargaba el archivo por su id y hacía
 * `fs.unlinkSync(path.resolve(rutaRelativa))` sobre lo que encontrara. Con el id de
 * un adjunto ajeno se borraba el fichero del disco de cualquier contenido.
 *
 * Colgarlo del contenido no es cosmético: es lo que da un padre que verificar. La
 * comprobación de que el archivo es de ese contenido la hace `deleteAttachment`.
 * Ningún frontend llamaba a la ruta vieja, así que no queda nada que migrar.
 */
router.delete('/:id', requierePermisoContenido('puedeEditar'), AttachmentController.delete);

export default router;
