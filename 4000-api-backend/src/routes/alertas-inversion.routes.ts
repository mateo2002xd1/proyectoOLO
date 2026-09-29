import { Router } from 'express';
import multer from 'multer';
import { AlertasInversionController } from '../controllers/alertas-inversion.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoAlertasInversion } from '../middlewares/permisos.middleware';
import { validarCuerpo } from '../middlewares/validar.middleware';
import { crearProyectoManualSchema } from '../validators/alertas-inversion.validators';
import { LIMITE_ABSOLUTO_BYTES } from '@olo/upload-policy';

const router = Router();

// Mismo orden de validación que `observatorio.routes.ts`: tamaño → tipo real por
// magic bytes (en el use-case) → lista blanca → nombre.
const subidaEnMemoria = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_ABSOLUTO_BYTES },
});

/**
 * @openapi
 * /api/alertas-inversion/grafico:
 *   get:
 *     tags: [AlertasInversion]
 *     summary: Proyectos de inversión publicados, por sector CIIU
 *     description: Público, sin sesión — conteo agregado, no dato personal.
 *     security: []
 *     parameters:
 *       - { name: departamento, in: query, description: Código DANE de dos dígitos., schema: { type: string } }
 *       - { name: anio, in: query, schema: { type: integer } }
 *     responses:
 *       200: { description: Cantidad de proyectos por sección CIIU. }
 */
router.get('/grafico', AlertasInversionController.grafico);

/**
 * @openapi
 * /api/alertas-inversion/listado:
 *   get:
 *     tags: [AlertasInversion]
 *     summary: Listado paginado de proyectos publicados
 *     security: []
 *     parameters:
 *       - { name: departamento, in: query, schema: { type: string } }
 *       - { name: anio, in: query, schema: { type: integer } }
 *       - { name: seccion, in: query, description: Letra de sección CIIU (A–U)., schema: { type: string } }
 *       - { name: pagina, in: query, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { name: porPagina, in: query, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *     responses:
 *       200: { description: Página de proyectos, total y totalPaginas. }
 */
router.get('/listado', AlertasInversionController.listado);

/**
 * @openapi
 * /api/alertas-inversion/opciones:
 *   get:
 *     tags: [AlertasInversion]
 *     summary: Catálogo de secciones CIIU activas y años con datos
 *     security: []
 *     responses:
 *       200: { description: Secciones y años disponibles. }
 */
router.get('/opciones', AlertasInversionController.opciones);

router.use(requireAuth);
router.use(requierePermisoAlertasInversion('puedeActualizarDatos'));

/**
 * @openapi
 * /api/alertas-inversion/cargas:
 *   get:
 *     tags: [AlertasInversion]
 *     summary: Historial de cargas
 *     responses:
 *       200: { description: Historial de cargas del módulo. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *   post:
 *     tags: [AlertasInversion]
 *     summary: Sube el Excel y actualiza la base de datos de inmediato
 *     description: |
 *       Solo Administrador y Superadmin. Cada fila del Excel es un proyecto anunciado
 *       independiente: se agrega al histórico (no reemplaza nada). Una fila cuya
 *       "Fuente" (URL) ya esté registrada se omite, para que re-subir el mismo
 *       archivo no duplique.
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
router.get('/cargas', AlertasInversionController.listarCargas);
router.post('/cargas', subidaEnMemoria.single('file'), AlertasInversionController.subir);

/**
 * @openapi
 * /api/alertas-inversion/cargas/{id}:
 *   get:
 *     tags: [AlertasInversion]
 *     summary: Estado de una carga puntual
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Estado de la carga. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: Carga no encontrada. }
 *   delete:
 *     tags: [AlertasInversion]
 *     summary: Elimina una carga del historial
 *     description: |
 *       Borra la fila de auditoría y, si ningún otro registro comparte el mismo
 *       archivo, también el Excel guardado en disco. Nunca toca los proyectos ya
 *       importados a `proyectos_inversion`.
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       204: { description: Eliminada. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: Carga no encontrada. }
 */
router.get('/cargas/:id', AlertasInversionController.obtenerCarga);
router.delete('/cargas/:id', AlertasInversionController.eliminarCarga);

/**
 * @openapi
 * /api/alertas-inversion/formatos/plantilla:
 *   get:
 *     tags: [AlertasInversion]
 *     summary: Descarga el Excel de ejemplo de la carga
 *     responses:
 *       200:
 *         description: El Excel, como adjunto.
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: El formato no está disponible en el servidor. }
 */
router.get('/formatos/plantilla', AlertasInversionController.descargarFormato);

/**
 * @openapi
 * /api/alertas-inversion/proyectos:
 *   post:
 *     tags: [AlertasInversion]
 *     summary: Alta manual de un proyecto de inversión
 *     description: Segunda vía de entrada de datos, junto a la carga de Excel. Nace publicado de una vez.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       201: { description: Proyecto creado. }
 *       400: { description: Datos inválidos o departamento no reconocido. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.post('/proyectos', validarCuerpo(crearProyectoManualSchema), AlertasInversionController.crearManual);

export default router;
