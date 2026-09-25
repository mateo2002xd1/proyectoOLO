import { Router } from 'express';
import { TrabajosController } from '../controllers/trabajos.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { limitadorDeTrabajos } from '../middlewares/rate-limit.middleware';

const router = Router();

/**
 * La cola de trabajos pesados no tenía **ninguna** autenticación.
 *
 * Los ids que reparte BullMQ son secuenciales ('1', '2', '3'…), así que `GET
 * /api/jobs/1` desde internet devolvía el `returnvalue` de la exportación de
 * cualquiera. Es el caso de manual de BOLA: identificador adivinable y ningún dueño
 * que comprobar. `consultarEstado` añade la otra mitad —que el trabajo sea tuyo—
 * ahora que hay una sesión con la que compararlo.
 */
router.use(requireAuth);

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     tags: [Trabajos]
 *     summary: Estado de un trabajo en cola
 *     description: |
 *       Progreso y resultado de una tarea pesada encolada por esta misma sesión.
 *
 *       **Caso de manual de BOLA, ya cerrado.** Esta ruta no tenía *ninguna*
 *       autenticación y los identificadores que reparte la cola son secuenciales
 *       (`1`, `2`, `3`…): `GET /api/jobs/1` desde internet devolvía el resultado de la
 *       exportación de cualquiera. Identificador adivinable y ningún dueño que
 *       comprobar. Ahora hay sesión, y además se comprueba que el trabajo sea de quien
 *       pregunta.
 *
 *       Un trabajo ajeno responde **404 y no 403**: un 403 confirmaría que ese id
 *       existe y devolvería la capacidad de enumerar que se acaba de quitar.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, example: '42' }
 *     responses:
 *       200:
 *         description: Estado del trabajo.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EstadoTrabajo' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       404:
 *         description: No existe — o no es de esta sesión.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', TrabajosController.consultarEstado);

/**
 * Encolar cuesta una petición; ejecutar cuesta un worker y memoria de Redis.
 *
 * Esa asimetría hacía de esta la ruta con mejor relación esfuerzo/daño de la API:
 * cualquier sesión válida podía encolar exportaciones masivas en bucle y saturar el
 * worker sin despeinarse, y la autenticación no lo impedía porque el atacante puede
 * tener cuenta. La cuota va por usuario, que es a quien hay que responsabilizar.
 */
/**
 * @openapi
 * /api/jobs/start-heavy-task:
 *   post:
 *     tags: [Trabajos]
 *     summary: Encolar una tarea pesada
 *     description: |
 *       Mete una exportación en la cola y devuelve su identificador para poder
 *       consultarla después.
 *
 *       **Por qué lleva cuota propia aunque ya exija sesión**: encolar cuesta una
 *       petición, ejecutar cuesta un worker y memoria de Redis. Esa asimetría hacía de
 *       esta la ruta con mejor relación esfuerzo/daño de la API —cualquier cuenta
 *       válida podía encolar exportaciones en bucle y saturar el worker— y la
 *       autenticación no lo impide, porque quien ataca puede tener cuenta. La cuota va
 *       **por usuario**, que es a quien hay que responsabilizar.
 *     responses:
 *       202:
 *         description: Trabajo encolado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobId: { type: string, example: '42' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.post('/start-heavy-task', limitadorDeTrabajos, TrabajosController.encolarTarea);

export default router;
