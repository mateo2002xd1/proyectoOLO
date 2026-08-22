import { Router } from 'express';
import { AttachmentController } from '../controllers/adjuntos.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoContenido } from '../middlewares/permisos.middleware';

// `mergeParams` es lo que deja ver `:contenidoId` del prefijo con el que `app.ts`
// monta este router. Sin él, el padre de la URL no llegaría hasta aquí y no habría
// contra qué comprobar la pertenencia.
const router = Router({ mergeParams: true });
router.use(requireAuth);

/**
 * @openapi
 * /api/contenidos/{contenidoId}/attachments:
 *   get:
 *     tags: [Adjuntos]
 *     summary: Adjuntos de un contenido
 *     description: |
 *       Los archivos que cuelgan de un contenido (RF-02). Todas las rutas de adjuntos
 *       cuelgan del contenido padre a propósito: es lo que da un objeto contra el que
 *       comprobar la pertenencia.
 *     parameters:
 *       - name: contenidoId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Adjuntos del contenido.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Adjunto' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.get('/', AttachmentController.getByPost);

/**
 * @openapi
 * /api/contenidos/{contenidoId}/attachments:
 *   post:
 *     tags: [Adjuntos]
 *     summary: Subir un adjunto
 *     description: |
 *       Sube un archivo y lo asocia al contenido de la ruta (RF-02).
 *
 *       **La política de subida es única para las dos aplicaciones** y vive en
 *       `@olo/upload-policy`. Existía duplicada, y el resultado fue que una app tenía
 *       los cinco controles y la otra ninguno: la subida del sitio aceptaba cualquier
 *       archivo, de cualquier tamaño, de quien fuera.
 *
 *       Lo que se comprueba: lista blanca de tipos —nunca lista negra—, tipo real por
 *       *magic bytes* y no por la extensión ni por lo que declare el navegador, y
 *       límite de tamaño por tipo. **SVG está excluido a propósito**: es XML, admite
 *       `<script>` y handlers `on*`, y servido en línea ejecutaría JavaScript en
 *       nuestro propio origen.
 *
 *       El dueño se toma de la sesión, nunca del cuerpo.
 *     parameters:
 *       - name: contenidoId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *             required: [file]
 *     responses:
 *       201:
 *         description: Archivo subido.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Adjunto' }
 *       400:
 *         description: Tipo no permitido, tamaño excedido, o el contenido real no coincide con lo declarado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
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
/**
 * @openapi
 * /api/contenidos/{contenidoId}/attachments/{id}:
 *   delete:
 *     tags: [Adjuntos]
 *     summary: Eliminar un adjunto
 *     description: |
 *       Borra el adjunto **del contenido que dice la URL**, y comprueba que
 *       efectivamente sea suyo.
 *
 *       **Por qué la ruta tiene esta forma**: esto vivía suelto como
 *       `DELETE /api/attachments/:id`, sin padre contra el que comparar. Cargaba el
 *       archivo por su id y lo borraba del disco sin mirar de quién era, así que con
 *       el id de un adjunto ajeno se borraba el fichero de cualquier contenido.
 *       Colgarla del contenido no es cosmético: es lo que da un padre que verificar.
 *     parameters:
 *       - name: contenidoId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: Adjunto eliminado.
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404:
 *         description: No existe, o no pertenece a ese contenido.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', requierePermisoContenido('puedeEditar'), AttachmentController.delete);

export default router;
