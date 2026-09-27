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
 *
 *       **No incluye los guardados automáticos previos a un envío.** Hasta el 23/9/2026 el
 *       editor guardaba solo un instante antes de enviar a revisión, y cada envío dejaba
 *       un «guardar borrador» que nadie había pulsado y que el propio envío ya cuenta. Siguen
 *       en la tabla —no se borran—, pero ni este listado ni el total los traen. El análisis
 *       de la depuración sí los cuenta, porque es lo que se va a borrar.
 *     parameters:
 *       - name: usuarioId
 *         in: query
 *         schema: { type: string, format: uuid }
 *         description: Filtra por quién hizo el cambio.
 *       - name: accion
 *         in: query
 *         description: |
 *           Uno o varios verbos separados por coma (`actualizar,guardar_borrador`), porque
 *           una etiqueta de la pantalla puede agrupar varios. Los que no existan se descartan.
 *           `autenticar`, `expirar` e `inactivar` son de seguridad (migración 030), igual
 *           que `bloquear` y `verificar_preguntas` (migración 031).
 *         schema:
 *           type: string
 *           example: actualizar,guardar_borrador,enviar_revision
 *           description: |
 *             Verbos válidos: crear, actualizar, eliminar, publicar, despublicar, aprobar,
 *             rechazar, enviar_revision, guardar_borrador, cambiar_password, autenticar,
 *             expirar, inactivar, bloquear, verificar_preguntas.
 *       - name: categoria
 *         in: query
 *         description: |
 *           La categoría de la pantalla de Auditoría. Se combina con `accion` con «y»: sirve
 *           para separar lo que comparte verbo, como editar una página (`editorial`) y
 *           modificar una cuenta (`seguridad`), que son `actualizar` las dos.
 *
 *           - `editorial`: crear una página y editar una sección o página, desde el editor
 *             (`crear`, `actualizar`, `guardar_borrador`, `enviar_revision` sobre `pagina` y
 *             `contenido`).
 *           - `administracion`: `rechazar`, `aprobar`, `publicar` y `despublicar`.
 *           - `seguridad`: `autenticar`, `expirar`, `inactivar`, `bloquear`,
 *             `verificar_preguntas`, `cambiar_password` y
 *             `eliminar` (de cualquier entidad), más `crear` y `actualizar` sobre `usuario`,
 *             `rol` y `configuracion`.
 *
 *           Cada fila de la respuesta trae su `categoria`. Un valor desconocido se descarta.
 *         schema:
 *           type: string
 *           enum: [editorial, administracion, seguridad]
 *       - name: entidadTipo
 *         in: query
 *         description: Una o varias entidades separadas por coma.
 *         schema:
 *           type: string
 *           example: pagina,contenido
 *           description: |
 *             Entidades válidas: contenido, pagina, seccion, usuario, rol, marca,
 *             configuracion, archivo.
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
 * Depuración de la bitácora: primero se analiza qué se borraría y después se borra.
 */
router.get('/depurar/analizar', AuditController.analizarDepuracion);
router.post('/depurar', AuditController.ejecutarDepuracion);

export default router;
