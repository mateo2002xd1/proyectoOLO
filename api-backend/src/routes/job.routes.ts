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

router.get('/:id', TrabajosController.consultarEstado);

/**
 * Encolar cuesta una petición; ejecutar cuesta un worker y memoria de Redis.
 *
 * Esa asimetría hacía de esta la ruta con mejor relación esfuerzo/daño de la API:
 * cualquier sesión válida podía encolar exportaciones masivas en bucle y saturar el
 * worker sin despeinarse, y la autenticación no lo impedía porque el atacante puede
 * tener cuenta. La cuota va por usuario, que es a quien hay que responsabilizar.
 */
router.post('/start-heavy-task', limitadorDeTrabajos, TrabajosController.encolarTarea);

export default router;
