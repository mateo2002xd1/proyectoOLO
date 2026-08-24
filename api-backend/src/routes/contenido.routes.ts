import { Router } from 'express';
import { ContenidoController } from '../controllers/contenido.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { cacheInterceptor } from '../middlewares/cache.middleware';
import { requierePermisoContenido } from '../middlewares/permisos.middleware';

const router = Router();

/**
 * @openapi
 * /api/contenidos/publica:
 *   get:
 *     tags: [Contenidos]
 *     summary: Contenidos publicados (público)
 *     description: |
 *       Lo que ve el portal público: solo contenido en estado `publicado` (RF-10,
 *       RF-12). **No exige sesión** — es el catálogo abierto del sitio.
 *
 *       Va declarada antes del `requireAuth` del router a propósito: en Express el
 *       orden es el que manda, y colocarla después la habría dejado cerrada.
 *
 *       Respuesta cacheada 5 minutos. `sectionId` es el **único** parámetro que entra
 *       en la clave de caché porque es el único que el caso de uso lee: aceptar
 *       cualquier parámetro en la clave convierte la caché en un almacén que un
 *       visitante puede llenar a voluntad con variantes inútiles.
 *     security: []
 *     parameters:
 *       - name: sectionId
 *         in: query
 *         required: false
 *         schema: { type: string, format: uuid }
 *         description: Filtra por sección de la taxonomía.
 *     responses:
 *       200:
 *         description: Contenidos publicados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Contenido' }
 */
// Público (RF-10, RF-12) — debe ir antes del requireAuth
// `sectionId` es el único parámetro que lee `listarPublicados`, así que es el único
// que entra en la clave de caché. Ver `cache.middleware.ts`.
router.get(
  '/publica',
  cacheInterceptor(300, { paramsPermitidos: ['sectionId'] }),
  ContenidoController.listarPublicados
);

router.use(requireAuth);

/**
 * @openapi
 * /api/contenidos/admin/global-lookup:
 *   get:
 *     tags: [Contenidos]
 *     summary: Buscador del panel
 *     description: |
 *       Búsqueda de texto completo sobre título, cuerpo y resumen de **todo** el
 *       contenido —publicado o no— que además devuelve el autor de cada resultado
 *       (RF-10).
 *
 *       Ese alcance es exactamente el de `puedeVerNoPublicado`, así que exige lo
 *       mismo: un buscador que atraviesa borradores ajenos es una forma indirecta de
 *       leerlos.
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema: { type: string, minLength: 1 }
 *         description: Texto a buscar.
 *     responses:
 *       200:
 *         description: Resultados con su autor.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Contenido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
// El buscador del panel atraviesa título, cuerpo y resumen de **todo** el contenido,
// publicado o no, y devuelve además el autor de cada resultado. Es el mismo alcance
// que `puedeVerNoPublicado`, así que exige lo mismo.
router.get(
  '/admin/global-lookup',
  requierePermisoContenido('puedeVerNoPublicado'),
  ContenidoController.globalLookup
);

/**
 * @openapi
 * /api/contenidos:
 *   get:
 *     tags: [Contenidos]
 *     summary: Listar contenidos del panel
 *     description: |
 *       El listado que ve quien edita. Lo que se devuelve depende de la sesión: sin
 *       `puedeVerNoPublicado`, lo no publicado de otras personas no aparece.
 *     responses:
 *       200:
 *         description: Contenidos visibles para esta sesión.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Contenido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 */
router.get('/', ContenidoController.getAll);

/**
 * @openapi
 * /api/contenidos/{id}:
 *   get:
 *     tags: [Contenidos]
 *     summary: Consultar un contenido
 *     description: |
 *       **Responde 404, no 403, cuando el contenido no debería ser visible.** Quien no
 *       es el autor ni tiene `puedeVerNoPublicado` recibe 404 aunque el id exista: un
 *       403 confirmaría que ese identificador es real y convertiría el endpoint en un
 *       enumerador de borradores.
 *
 *       Esa decisión necesita la fila delante, así que la toma el caso de uso y no un
 *       middleware de ruta.
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: El contenido.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Contenido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
// `getById` filtra por sí mismo lo no publicado: quien no es el autor ni tiene
// `puedeVerNoPublicado` recibe 404 aunque el id exista. Esa decisión necesita la fila
// delante, así que la toma el caso de uso y no un middleware.
router.get('/:id', ContenidoController.getById);

/**
 * @openapi
 * /api/contenidos:
 *   post:
 *     tags: [Contenidos]
 *     summary: Crear un contenido
 *     description: |
 *       Alta de estudio, informe, estadística o banner (RF-01). Nace en `borrador`: el
 *       Editor propone y el ciclo editorial decide cuándo se publica (RF-06).
 *
 *       El HTML del cuerpo se **sanea en el servidor** antes de guardarse. Que el
 *       editor del navegador limpie lo que escribe está bien para la experiencia, pero
 *       no es un control: una petición directa no pasa por ese editor.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: string }
 *               resumen: { type: string }
 *               cuerpo: { type: string, description: HTML. Se sanea en el servidor. }
 *               section_id: { type: string, format: uuid, nullable: true }
 *             required: [titulo]
 *     responses:
 *       201:
 *         description: Contenido creado, en estado borrador.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Contenido' }
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.post('/', requierePermisoContenido('puedeEditar'), ContenidoController.create);

/**
 * @openapi
 * /api/contenidos/{id}:
 *   patch:
 *     tags: [Contenidos]
 *     summary: Editar un contenido
 *     description: |
 *       **La edición es colaborativa por decisión de producto**: cualquier Editor
 *       trabaja sobre el borrador de otro. La autoría se registra para el historial
 *       (RF-07), no para negar el paso. Lo que sí mira al dueño es borrar.
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: string }
 *               resumen: { type: string }
 *               cuerpo: { type: string }
 *               section_id: { type: string, format: uuid, nullable: true }
 *               estado:
 *                 type: string
 *                 enum: [borrador, en_revision, publicado, rechazado]
 *     responses:
 *       200:
 *         description: Contenido actualizado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Contenido' }
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.patch('/:id', requierePermisoContenido('puedeEditar'), ContenidoController.update);

/**
 * @openapi
 * /api/contenidos/{id}:
 *   delete:
 *     tags: [Contenidos]
 *     summary: Eliminar un contenido
 *     description: |
 *       **Borrar sí mira al autor**, al revés que editar. `puedeEditar` deja pasar a
 *       cualquier Editor —la edición es colaborativa—, pero destruir lo de otro queda
 *       para quien aprueba. El caso de uso añade la excepción del autor sobre lo suyo.
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: Contenido eliminado.
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
// Borrar sí mira al autor: `puedeEditar` deja pasar a cualquier Editor —la edición es
// colaborativa— pero destruir lo de otro queda para quien aprueba. El caso de uso
// completa la excepción del autor sobre lo suyo.
router.delete('/:id', requierePermisoContenido('puedeEditar'), ContenidoController.delete);

export default router;
