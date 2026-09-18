import { Router } from 'express';
import { AuditController } from '../controllers/auditoria.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoAuditoria } from '../middlewares/permisos.middleware';
import { requirePermission } from '../middlewares/require-permission.middleware';

const router = Router();

/**
 * Consulta de la bitácora (RF-07).
 *
 * `requireAuth` sola NO basta aquí, aunque durante un tiempo fue lo único que
 * había: la respuesta incluye la IP y el user-agent de cada editor, así que con
 * solo exigir sesión cualquier usuario autenticado —un `Director/Subdirector`,
 * de solo lectura, incluido— podía leer el rastro completo de todos sus
 * compañeros.
 *
 * El filtro va en el router y no en el controlador para que ninguna ruta nueva
 * pueda añadirse aquí por descuido sin pasar por él.
 */
router.use(requireAuth, requierePermisoAuditoria('puedeVer'), requirePermission('auditoria.ver'));

/**
 * @openapi
 * /api/audit-logs:
 *   get:
 *     tags: [Auditoría]
 *     summary: Consultar la bitácora
 *     description: |
 *       Historial de cambios del sistema (RF-07): quién hizo qué, sobre qué y cuándo,
 *       con los campos modificados, la IP y el user-agent.
 *
 *       **Tener sesión no basta.** La respuesta trae la IP y el user-agent de cada
 *       persona que trabaja en el sistema; con solo `requireAuth` —que fue lo único
 *       que hubo un tiempo— cualquier cuenta autenticada leía el rastro completo de
 *       sus compañeros. Exige `auditoria.ver`, que en la práctica es solo el
 *       Administrador: ni editor, ni director, ni subdirector la leen.
 *
 *       **El tope de 200 filas por petición no es negociable desde el cliente.** Antes
 *       `?limit=1000000` era una petición válida contra la tabla que más crece del
 *       sistema.
 *
 *       Una `accion` fuera del catálogo se descarta en vez de dar error, y un rango de
 *       fechas sin resultados devuelve una página vacía con `total: 0`.
 *     parameters:
 *       - name: usuarioId
 *         in: query
 *         schema: { type: string, format: uuid }
 *         description: Filtra por quién hizo el cambio.
 *       - name: accion
 *         in: query
 *         schema:
 *           type: string
 *           enum: [crear, actualizar, eliminar, publicar, aprobar, rechazar, cambiar_password]
 *       - name: entidad
 *         in: query
 *         schema: { type: string, example: usuarios }
 *       - name: desde
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: hasta
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: pagina
 *         in: query
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - name: limite
 *         in: query
 *         schema: { type: integer, minimum: 1, maximum: 200, default: 50 }
 *         description: Se recorta a 200 en el servidor, se pida lo que se pida.
 *     responses:
 *       200:
 *         description: Página de registros.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginaDeAuditoria' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.get('/', AuditController.getAll);

/**
 * Endpoints de depuración de la tabla de auditoría
 */
router.get('/depurar/analizar', AuditController.analizarDepuracion);
router.post('/depurar', AuditController.ejecutarDepuracion);

/**
 * @openapi
 * /api/audit-logs/{contentType}/{contentId}:
 *   get:
 *     tags: [Auditoría]
 *     summary: Historial de un objeto concreto
 *     description: |
 *       El rastro completo de una entidad: todos los cambios sobre ese contenido,
 *       página o usuario, en orden.
 *
 *       **Las contraseñas no llegan aquí.** Un cambio de contraseña se registra como
 *       acción —la Ley 1581 obliga a poder consultarlo— pero el campo se guarda como
 *       «valor omitido»: ni el valor anterior ni el nuevo tocan la tabla. Hay una
 *       comprobación automatizada que lo verifica (`npm run auditoria:verificar`).
 *     parameters:
 *       - name: contentType
 *         in: path
 *         required: true
 *         schema: { type: string, example: usuarios }
 *         description: Tipo de entidad.
 *       - name: contentId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Registros de ese objeto.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/RegistroAuditoria' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.get('/:contentType/:contentId', AuditController.getByContentId);

export default router;
