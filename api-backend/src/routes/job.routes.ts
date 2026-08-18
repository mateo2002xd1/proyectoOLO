import { Router } from 'express';
import { TrabajosController } from '../controllers/trabajos.controller';
import { requireAuth } from '../middlewares/auth.middleware';

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
router.post('/start-heavy-task', TrabajosController.encolarTarea);

export default router;
