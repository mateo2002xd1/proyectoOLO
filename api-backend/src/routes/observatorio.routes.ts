import { Router } from 'express';
import multer from 'multer';
import { ObservatorioController } from '../controllers/observatorio.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoObservatorio } from '../middlewares/permisos.middleware';
import { LIMITE_ABSOLUTO_BYTES } from '@olo/upload-policy';

const router = Router();

// En memoria: el archivo se valida por magic bytes y se escribe a disco desde el
// use-case, no desde el middleware — mismo orden que ya sigue `@olo/upload-policy`
// en los otros dos frontends (tamaño → tipo real → lista blanca → nombre).
//
// Reemplaza al `express.raw({ type: 'application/octet-stream' })` de la primera
// versión de esta ruta: aquella no validaba tipo real por magic bytes ni guardaba
// nombre original, y no dejaba rastro de quién subió qué.
const subidaEnMemoria = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_ABSOLUTO_BYTES },
});

/**
 * @openapi
 * /api/observatorio/programas-sobresalientes:
 *   get:
 *     tags: [Observatorio]
 *     summary: Datos vigentes del mapa de formación por departamento
 *     description: |
 *       El contenido completo de `programas_sobresalientes` — pública, sin sesión,
 *       porque es analítica agregada y no dato personal. Cada carga vacía y
 *       recarga la tabla entera, así que esto siempre refleja la última carga
 *       que terminó bien.
 *     security: []
 *     responses:
 *       200:
 *         description: Registros vigentes.
 */
router.get('/programas-sobresalientes', ObservatorioController.obtenerActual);

router.use(requireAuth);
router.use(requierePermisoObservatorio('puedeActualizarDatos'));

/**
 * @openapi
 * /api/observatorio/cargas:
 *   get:
 *     tags: [Observatorio]
 *     summary: Historial de cargas
 *     responses:
 *       200: { description: Historial de cargas del módulo. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *   post:
 *     tags: [Observatorio]
 *     summary: Sube el Excel y actualiza la base de datos de inmediato
 *     description: |
 *       Solo Administrador y Superadmin — no hay editor en este flujo ni paso de
 *       aprobación. El archivo se valida (tipo real por magic bytes, solo `.xlsx`,
 *       tamaño) y se procesa de forma asíncrona en la cola de trabajos pesados; esta
 *       respuesta llega antes de que la carga termine.
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
 *       202: { description: Archivo recibido, procesando. }
 *       400: { description: No se envió archivo. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       415: { description: Tipo de archivo no permitido. }
 */
router.get('/cargas', ObservatorioController.listarCargas);
router.post('/cargas', subidaEnMemoria.single('file'), ObservatorioController.subir);

/**
 * @openapi
 * /api/observatorio/cargas/{id}:
 *   get:
 *     tags: [Observatorio]
 *     summary: Estado de una carga puntual
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Estado de la carga. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: Carga no encontrada. }
 */
router.get('/cargas/:id', ObservatorioController.obtenerCarga);

/**
 * @openapi
 * /api/observatorio/cargas/{id}:
 *   delete:
 *     tags: [Observatorio]
 *     summary: Elimina una carga del historial
 *     description: |
 *       Borra la fila de auditoría y, si ningún otro registro comparte el mismo
 *       archivo (mismo Excel subido dos veces, o adjunto en un contenido de
 *       RF-02), también el Excel guardado en disco. Nunca toca los datos ya
 *       importados a `programas_sobresalientes`.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Eliminada. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: Carga no encontrada. }
 */
router.delete('/cargas/:id', ObservatorioController.eliminarCarga);

export default router;
