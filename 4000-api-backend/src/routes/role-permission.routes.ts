import { Router } from 'express';
import { RolePermissionController } from '../controllers/role-permissions.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoUsuario } from '../middlewares/permisos.middleware';
import { requirePermission } from '../middlewares/require-permission.middleware';
import { validarCuerpo } from '../middlewares/validar.middleware';
import { asignarPermisoSchema } from '../validators/usuarios.validators';

const router = Router();

// Asignar y revocar permisos a roles. Es el endpoint que convierte cualquier cuenta en
// cualquier cosa, y hasta ahora bastaba con estar autenticado para llamarlo.
// Dos capas: el rol decide quién entra al panel de seguridad, el permiso del
// catálogo decide si esta persona en concreto puede tocarlo.
router.use(
  requireAuth,
  requierePermisoUsuario('puedeAdministrarSeguridad'),
  requirePermission('usuarios.permisos')
);

/**
 * @openapi
 * /api/role-permissions:
 *   get:
 *     tags: [Roles y permisos]
 *     summary: Listar todas las asignaciones
 *     description: |
 *       Qué permiso tiene concedido cada rol. **Este es el endpoint que convierte
 *       cualquier cuenta en cualquier cosa** y durante un tiempo bastaba con estar
 *       autenticado para llamarlo, así que el router entero exige
 *       `puedeAdministrarSeguridad` y la clave `usuarios.permisos`.
 *     responses:
 *       200:
 *         description: Asignaciones rol → permiso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   role_id: { type: string, format: uuid }
 *                   permission_id: { type: string, format: uuid }
 *                   clave: { type: string, example: editar.intranet.tasa }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.get('/', RolePermissionController.getAll);

/**
 * @openapi
 * /api/role-permissions/role/{roleId}:
 *   get:
 *     tags: [Roles y permisos]
 *     summary: Permisos concedidos a un rol
 *     description: |
 *       Las claves de un rol concreto. Es lo que pinta la matriz de permisos del panel
 *       de seguridad.
 *     parameters:
 *       - name: roleId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Permisos de ese rol.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Permiso' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.get('/role/:roleId', RolePermissionController.getByRole);

/**
 * @openapi
 * /api/role-permissions:
 *   post:
 *     tags: [Roles y permisos]
 *     summary: Conceder un permiso a un rol
 *     description: |
 *       Asigna una clave del catálogo a un rol. La operación queda registrada en la
 *       bitácora: conceder permisos es exactamente el tipo de cambio que RF-07 existe
 *       para poder reconstruir después.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id: { type: string, format: uuid }
 *               permission_id: { type: string, format: uuid }
 *             required: [role_id, permission_id]
 *     responses:
 *       201:
 *         description: Permiso concedido.
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.post('/', validarCuerpo(asignarPermisoSchema), RolePermissionController.assign);

/**
 * @openapi
 * /api/role-permissions:
 *   delete:
 *     tags: [Roles y permisos]
 *     summary: Revocar un permiso de un rol
 *     description: |
 *       El par a revocar viaja en el **cuerpo** y no en la ruta, porque la asignación
 *       se identifica por la pareja rol + permiso y no por un id propio.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id: { type: string, format: uuid }
 *               permission_id: { type: string, format: uuid }
 *             required: [role_id, permission_id]
 *     responses:
 *       200:
 *         description: Permiso revocado.
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.delete('/', validarCuerpo(asignarPermisoSchema), RolePermissionController.revoke);

export default router;
