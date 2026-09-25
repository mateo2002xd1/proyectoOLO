import { Router } from 'express';
import { PermissionController } from '../controllers/permisos.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoUsuario } from '../middlewares/permisos.middleware';
import { requirePermission } from '../middlewares/require-permission.middleware';

const router = Router();

// El catálogo de permisos es la definición de qué se puede conceder. Estaba abierto a
// cualquier sesión, incluido el `POST`: se podía inventar un permiso y asignárselo
// acto seguido por `/api/role-permissions`, que también estaba abierto.
// Dos capas: el rol decide quién entra al panel de seguridad, el permiso del
// catálogo decide si esta persona en concreto puede tocarlo.
router.use(
  requireAuth,
  requierePermisoUsuario('puedeAdministrarSeguridad'),
  requirePermission('usuarios.permisos')
);

/**
 * @openapi
 * /api/permissions:
 *   get:
 *     tags: [Roles y permisos]
 *     summary: Catálogo de permisos
 *     description: |
 *       Todas las claves concedibles del sistema. El catálogo es **la definición de
 *       qué se puede conceder**, así que el router entero exige
 *       `puedeAdministrarSeguridad` y la clave `usuarios.permisos`: estuvo abierto a
 *       cualquier sesión —el `POST` incluido—, de modo que se podía inventar un
 *       permiso y asignárselo acto seguido.
 *
 *       Las claves de sección se construyen como `editar.{ambito}.{slug}`; las demás
 *       son fijas (`usuarios.crear`, `auditoria.ver`, `secciones.eliminar`…).
 *     responses:
 *       200:
 *         description: Permisos disponibles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Permiso' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.get('/', PermissionController.getAll);

/**
 * @openapi
 * /api/permissions/{id}:
 *   get:
 *     tags: [Roles y permisos]
 *     summary: Consultar un permiso
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: El permiso.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Permiso' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.get('/:id', PermissionController.getById);

/**
 * @openapi
 * /api/permissions:
 *   post:
 *     tags: [Roles y permisos]
 *     summary: Crear un permiso
 *     description: |
 *       Añade una clave al catálogo. Normalmente no hace falta llamarla a mano: las
 *       claves de sección las siembra la propia creación de secciones.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clave: { type: string, example: contenidos.exportar }
 *               descripcion: { type: string }
 *             required: [clave]
 *     responses:
 *       201:
 *         description: Permiso creado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Permiso' }
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.post('/', PermissionController.create);

/**
 * @openapi
 * /api/permissions/{id}:
 *   patch:
 *     tags: [Roles y permisos]
 *     summary: Editar un permiso
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clave: { type: string }
 *               descripcion: { type: string }
 *     responses:
 *       200:
 *         description: Permiso actualizado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Permiso' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.patch('/:id', PermissionController.update);

/**
 * @openapi
 * /api/permissions/{id}:
 *   delete:
 *     tags: [Roles y permisos]
 *     summary: Eliminar un permiso
 *     description: |
 *       Borra la clave del catálogo y, con ella, las asignaciones que la usaran. Los
 *       roles que dependían de ese permiso pierden el acceso que concedía.
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: Permiso eliminado.
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.delete('/:id', PermissionController.delete);

export default router;
