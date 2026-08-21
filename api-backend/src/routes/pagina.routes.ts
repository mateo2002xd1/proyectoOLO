import { Router } from 'express';
import { PaginaController } from '../controllers/pagina.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { cacheInterceptor } from '../middlewares/cache.middleware';
import { requierePermisoPagina } from '../middlewares/permisos.middleware';
import { limitadorDeEscritura } from '../middlewares/rate-limit.middleware';
import { validarCuerpo } from '../middlewares/validar.middleware';
import {
  crearSeccionSchema,
  eliminarSeccionSchema,
  guardarBorradorSchema,
} from '../validators/paginas.validators';
import {
  requirePermission,
  requierePermisoDeSeccion,
} from '../middlewares/require-permission.middleware';
import { AMBITO_HEADER } from '../shared/ambito';

const router = Router();

/**
 * Las escrituras del editor las limita `limitadorDeEscritura`, definido en
 * `rate-limit.middleware.ts` junto a los demás.
 *
 * El TODO que había aquí —«se aplica por IP; para granularidad por usuario, añadir
 * keyGenerator con req.user?.id»— ya está hecho: la fábrica cuenta por sesión cuando
 * la hay, y estas rutas van todas después del `requireAuth` de abajo, así que la hay.
 * Contar por IP era especialmente malo justo en este endpoint: una sede entera detrás
 * del mismo NAT compartía las treinta escrituras por minuto entre todos sus editores,
 * y el autoguardado se las gastaba solo.
 *
 * @see openspec/changes/qa-seguridad-vistas-intranet/specs/qa-intranet-rbac-enforcement/spec.md
 */

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
/**
 * Crear una sección.
 *
 * No lleva `requierePermisoDeSeccion()` —y no es un olvido—: ese middleware exige que
 * la sección ya exista, así que aplicarlo aquí haría imposible crear la primera. El
 * poder que reparte esta ruta lo controla `secciones.crear`, que es una clave fija y
 * por tanto sí se puede exigir antes de saber de qué sección hablamos.
 *
 * Va antes que `/:slug/...` por costumbre de lectura, no por necesidad: Express
 * distingue `POST /` de `POST /:slug/borrador` por la forma de la ruta, no por el
 * orden.
 */
router.post(
  '/',
  limitadorDeEscritura,
  requierePermisoPagina('puedeEditar'),
  requirePermission('secciones.crear'),
  validarCuerpo(crearSeccionSchema),
  PaginaController.crearSeccion
);

/**
 * Eliminar una sección, y su consulta previa.
 *
 * Van con `secciones.eliminar` y **no** con `requierePermisoDeSeccion()`, que sería lo
 * natural pero aquí hace daño: ese middleware exige la clave `editar.{ambito}.{slug}`,
 * que solo tiene el rol que creó la sección. Un administrador que llega a limpiar algo
 * que no creó él se quedaría fuera de la única ruta que sirve para limpiarlo.
 */
router.get(
  '/:slug/eliminable',
  requierePermisoPagina('puedeEditar'),
  requirePermission('secciones.eliminar'),
  PaginaController.analizarEliminacion
);
router.delete(
  '/:slug',
  limitadorDeEscritura,
  requierePermisoPagina('puedeEditar'),
  requirePermission('secciones.eliminar'),
  validarCuerpo(eliminarSeccionSchema),
  PaginaController.eliminarSeccion
);

router.get(
  '/:slug/editable',
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  PaginaController.obtenerEditable
);
router.post(
  '/:slug/borrador',
  limitadorDeEscritura,
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  // La validación va después de los permisos y no antes: a quien no puede editar esta
  // sección se le responde 403 sin mirarle el cuerpo, que es más barato y no le confirma
  // qué forma espera el endpoint.
  validarCuerpo(guardarBorradorSchema),
  PaginaController.guardarBorrador
);
// Enviar a revisión pide además el permiso propio: se puede querer que alguien redacte
// borradores sin poder meterlos en la cola de aprobación.
router.patch(
  '/:slug/enviar-revision',
  limitadorDeEscritura,
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

