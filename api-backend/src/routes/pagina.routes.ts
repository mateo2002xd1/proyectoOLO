import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { PaginaController } from '../controllers/pagina.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { cacheInterceptor } from '../middlewares/cache.middleware';
import { requierePermisoPagina } from '../middlewares/permisos.middleware';
import {
  requirePermission,
  requierePermisoDeSeccion,
} from '../middlewares/require-permission.middleware';
import { AMBITO_HEADER } from '../shared/ambito';

const router = Router();

/**
 * Rate limiting para operaciones de escritura de páginas.
 *
 * Los límites son generosos para no interferir con el autosave del editor
 * (que puede guardar cada pocos segundos), pero lo suficientemente bajos para
 * detectar abuso automatizado.
 *
 * Se aplica por IP. Para granularidad por usuario, añadir keyGenerator con
 * req.user?.id una vez que el middleware de auth haya corrido antes.
 *
 * @see openspec/changes/qa-seguridad-vistas-intranet/specs/qa-intranet-rbac-enforcement/spec.md
 */
const escrituraLimiter = rateLimit({
  windowMs: 60 * 1000,        // ventana de 1 minuto
  max: 30,                     // máx 30 escrituras por minuto por IP
  message: { error: 'Demasiadas solicitudes de escritura. Espera un momento antes de continuar.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.role?.toLowerCase() === 'superadmin', // superadmin no tiene límite
});

// El ámbito entra en la clave de caché: `/publica/inicio` devuelve una página
// distinta según la pida el sitio o la intranet.
router.get(
  '/publica/:slug',
  cacheInterceptor(300, { varyBy: [AMBITO_HEADER] }),
  PaginaController.obtenerPublica
);

router.use(requireAuth);

/**
 * Dos capas sobre cada operación de edición, y hacen cosas distintas:
 *
 *  - `requierePermisoPagina('puedeEditar')` — **si** esta persona edita. Va por rol:
 *    dirección y subdirección entran a la intranet pero no editan.
 *  - `requierePermisoDeSeccion()` — **qué** puede editar. Va por `roles_permisos`, con
 *    la clave `editar.{ambito}.{slug}` construida desde la petición.
 *
 * La segunda es la que ata a un editor a secciones concretas, que es lo que el catálogo
 * de permisos existe para poder decir. La primera se conserva porque sigue siendo cierta
 * y porque un fallo en una no debe abrir la otra (§0.2 de 3-seguridad-del-proyecto.md).
 */
router.get(
  '/:slug/editable',
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  PaginaController.obtenerEditable
);
router.post(
  '/:slug/borrador',
  escrituraLimiter,
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  PaginaController.guardarBorrador
);
// Enviar a revisión pide además el permiso propio: se puede querer que alguien redacte
// borradores sin poder meterlos en la cola de aprobación.
router.patch(
  '/:slug/enviar-revision',
  escrituraLimiter,
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  requirePermission('editor.enviar-revision'),
  PaginaController.enviarARevision
);
// Descartar una versión sin publicar. Se pide el id de la versión y no solo el
// slug para no borrar por error algo distinto de lo que se está mirando.
router.delete(
  '/:slug/versiones/:versionId',
  requierePermisoPagina('puedePublicar'),
  PaginaController.eliminarVersion
);

router.patch('/:slug/aprobar', requierePermisoPagina('puedePublicar'), PaginaController.aprobar);
router.patch('/:slug/rechazar', requierePermisoPagina('puedeRechazar'), PaginaController.rechazar);

// La cola de revisión existe para aprobar o rechazar; quien no puede hacer ninguna
// de las dos no tiene nada que hacer aquí.
router.get('/en-revision', requierePermisoPagina('puedePublicar'), PaginaController.listarEnRevision);

export default router;

