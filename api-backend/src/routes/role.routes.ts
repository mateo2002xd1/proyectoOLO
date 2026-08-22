import { Router, type Request, type Response, type NextFunction } from 'express';
import { RoleController } from '../controllers/roles.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoUsuario } from '../middlewares/permisos.middleware';
import { requirePermission } from '../middlewares/require-permission.middleware';
import { usuariosPolicies } from '../policies/usuarios.policies';
import { esDueno, marcarGuardia } from '../shared/autorizacion';

const router = Router();
router.use(requireAuth);

/**
 * Consultar **un** rol: el propio, o cualquiera si administras seguridad.
 *
 * `sitio-web/src/shared/lib/session.ts` pide `GET /api/roles/<mi role_id>` en cada
 * carga para saber qué permisos tiene la sesión, y eso lo hace cualquier usuario, no
 * solo un administrador. Cerrar la ruta entera a administración dejaría a todos los
 * demás con la lista de permisos vacía.
 *
 * El id contra el que se compara es `req.user.role_id`, que desde el arreglo de
 * `auth.middleware.ts` viene de la fila del usuario y no del token: si a alguien le
 * cambian el rol, en la siguiente petición ya no puede leer el anterior.
 */
const administraOEsSuRol = marcarGuardia(
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });

    if (usuariosPolicies.puedeAdministrarSeguridad(req.user.role)) return next();
    if (esDueno(req.params.id, req.user.role_id)) return next();

    return res.status(403).json({ error: 'No tienes permisos para esta acción' });
  },
  'usuarios.administraOEsSuRol'
);

/**
 * @openapi
 * /api/roles/{id}:
 *   get:
 *     tags: [Roles y permisos]
 *     summary: Consultar un rol
 *     description: |
 *       **La única ruta de roles abierta a cuentas que no administran seguridad**, y
 *       tiene que serlo: los frontales piden su propio rol en cada carga para saber
 *       qué permisos tiene la sesión y decidir qué botones pintar. Cerrarla del todo
 *       dejaría a todo el mundo, menos a los administradores, con la lista de permisos
 *       vacía.
 *
 *       El id contra el que se compara sale de la **fila del usuario**, no del token:
 *       a quien le cambien el rol deja de poder leer el anterior en la petición
 *       siguiente.
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: El rol, con sus permisos.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Rol' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.get('/:id', administraOEsSuRol, RoleController.getById);

// El resto es la configuración de seguridad del sistema: quien crea roles o los edita
// se concede a sí mismo cualquier otra cosa. Sin filtro alguno, como estaba, bastaba
// una sesión cualquiera para fabricarse un rol con todos los permisos.
router.use(requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos'));

/**
 * @openapi
 * /api/roles:
 *   get:
 *     tags: [Roles y permisos]
 *     summary: Listar roles
 *     description: |
 *       Todos los roles del sistema (RF-04). A partir de aquí, todo el router exige
 *       `puedeAdministrarSeguridad` **y** la clave `usuarios.permisos`: quien toca
 *       roles se concede a sí mismo cualquier otra cosa.
 *
 *       Los nombres vienen capitalizados tal cual están en la base (`Editor`,
 *       `Superadmin`). Compararlos en minúsculas fallaba en silencio y dejaba a todo
 *       el mundo sin permisos sin que nada diera error; hay una prueba de regresión
 *       (`npm run permisos:verificar`) que existe justamente para eso.
 *     responses:
 *       200:
 *         description: Roles del sistema.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Rol' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.get('/', RoleController.getAll);

/**
 * @openapi
 * /api/roles:
 *   post:
 *     tags: [Roles y permisos]
 *     summary: Crear un rol
 *     description: |
 *       Alta de rol (RF-04). Sin ningún filtro —como estuvo un tiempo— bastaba una
 *       sesión cualquiera para fabricarse un rol con todos los permisos y asignárselo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string, example: Editor }
 *               descripcion: { type: string }
 *             required: [nombre]
 *     responses:
 *       201:
 *         description: Rol creado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Rol' }
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.post('/', RoleController.create);

/**
 * @openapi
 * /api/roles/{id}:
 *   patch:
 *     tags: [Roles y permisos]
 *     summary: Editar un rol
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
 *               descripcion: { type: string }
 *     responses:
 *       200:
 *         description: Rol actualizado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Rol' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.patch('/:id', RoleController.update);

/**
 * @openapi
 * /api/roles/{id}:
 *   delete:
 *     tags: [Roles y permisos]
 *     summary: Eliminar un rol
 *     description: |
 *       Un rol con cuentas asignadas no se puede borrar: dejaría esas cuentas sin
 *       forma de resolver sus permisos.
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: Rol eliminado.
 *       409:
 *         description: El rol todavía tiene cuentas asignadas.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.delete('/:id', RoleController.delete);

export default router;
