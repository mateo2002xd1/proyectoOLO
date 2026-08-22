import { Router } from 'express';
import { SectionController } from '../controllers/secciones.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoContenido } from '../middlewares/permisos.middleware';

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /api/sections:
 *   get:
 *     tags: [Secciones]
 *     summary: Listar la taxonomía
 *     description: |
 *       El árbol con el que se clasifica el contenido. **Leerla la necesita cualquiera
 *       que edite**, no solo quien la administra: el selector de sección del editor la
 *       consulta para poder clasificar lo que se escribe.
 *     responses:
 *       200:
 *         description: Secciones existentes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Seccion' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 */
// Leer la taxonomía la necesita cualquiera que edite: el selector de sección del
// editor la consulta para poder clasificar lo que escribe.
router.get('/', SectionController.getAll);

/**
 * @openapi
 * /api/sections/{id}:
 *   get:
 *     tags: [Secciones]
 *     summary: Consultar una sección
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: La sección.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Seccion' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.get('/:id', SectionController.getById);

/**
 * @openapi
 * /api/sections:
 *   post:
 *     tags: [Secciones]
 *     summary: Crear una sección de la taxonomía
 *     description: |
 *       **Cambiar la taxonomía reordena el portal entero**, así que no basta con poder
 *       editar contenido: exige `puedeAdministrarSecciones`. Es la diferencia entre
 *       clasificar dentro de un árbol y decidir cómo es el árbol.
 *
 *       No confundir con `POST /api/paginas`, que crea una **página editable** del
 *       portal. Esto es solo la etiqueta con la que se clasifican los contenidos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string, example: Estudios }
 *               parent_id: { type: string, format: uuid, nullable: true }
 *             required: [nombre]
 *     responses:
 *       201:
 *         description: Sección creada.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Seccion' }
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
// Cambiarla reordena el portal entero, así que no basta con poder editar contenido.
router.post('/', requierePermisoContenido('puedeAdministrarSecciones'), SectionController.create);

/**
 * @openapi
 * /api/sections/{id}:
 *   patch:
 *     tags: [Secciones]
 *     summary: Editar una sección
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               parent_id: { type: string, format: uuid, nullable: true }
 *     responses:
 *       200:
 *         description: Sección actualizada.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Seccion' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.patch('/:id', requierePermisoContenido('puedeAdministrarSecciones'), SectionController.update);

/**
 * @openapi
 * /api/sections/{id}:
 *   delete:
 *     tags: [Secciones]
 *     summary: Eliminar una sección
 *     description: |
 *       Los contenidos que colgaban de ella quedan sin clasificar; no se borran con la
 *       sección.
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: Sección eliminada.
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.delete('/:id', requierePermisoContenido('puedeAdministrarSecciones'), SectionController.delete);

export default router;
