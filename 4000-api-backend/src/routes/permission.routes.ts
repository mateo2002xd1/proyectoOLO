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
 *       Es de solo lectura: las claves fijas las define `catalogo-permisos.ts` (y las
 *       siembra `npm run sembrar:permisos`), y las de sección las crea y las retira la
 *       propia sección al crearse o borrarse. El alta, la edición y el borrado a mano
 *       (`POST`, `PATCH`, `DELETE`) se retiraron el 2026-09-26: ningún panel los usaba.
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

export default router;
