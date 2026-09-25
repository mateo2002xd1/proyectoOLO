import { Router, type Request, type Response, type NextFunction } from 'express';
import { UserController } from '../controllers/usuarios.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoUsuario } from '../middlewares/permisos.middleware';
import { requirePermission } from '../middlewares/require-permission.middleware';
import { validarCuerpo } from '../middlewares/validar.middleware';
import { usuariosPolicies } from '../policies/usuarios.policies';
import { esDueno, marcarGuardia } from '../shared/autorizacion';
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
} from '../validators/usuarios.validators';

const router = Router();
router.use(requireAuth);

/**
 * Administrar cuentas, o ser la cuenta.
 *
 * Esta ruta solo tenía `requireAuth`: cualquier sesión válida podía leer, modificar o
 * borrar cualquier usuario. Cambiando `role_id` se ascendía a Superadmin, y pidiendo
 * `reset_password` la respuesta devolvía la contraseña temporal de la víctima. Era la
 * escalada de privilegios más directa del sistema.
 *
 * La excepción por el propio id no es un hueco: es exactamente la comprobación que
 * pide BOLA —el dueño del recurso contra el id del token— y es lo que sostiene la
 * pantalla «Mi perfil», que hace `PATCH /api/users/<propio>` para cambiar nombre y
 * correo. Lo que ese usuario puede escribir sobre sí mismo lo limita `updateUser` con
 * una lista blanca, no este middleware: aquí solo se decide quién pasa.
 */
const administraOEsSuCuenta = marcarGuardia(
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });

    if (usuariosPolicies.puedeAdministrarUsuarios(req.user)) return next();
    if (esDueno(req.params.id, req.user.id)) return next();

    return res.status(403).json({ error: 'No tienes permisos para esta acción' });
  },
  'usuarios.administraOEsSuCuenta'
);

/**
 * Exige un permiso del catálogo, salvo cuando la persona actúa sobre su propia cuenta.
 *
 * Sin esta excepción, «Mi perfil» dejaría de funcionar para cualquiera que no tenga
 * `usuarios.editar` — es decir, para todo el mundo menos los administradores. Editarse a
 * uno mismo no es administrar usuarios, y lo que puede escribir ahí ya lo acota la lista
 * blanca de `updateUser`.
 */
const exigePermisoSalvoCuentaPropia = (clave: string) =>
  marcarGuardia(
    (req: Request, res: Response, next: NextFunction) => {
      if (esDueno(req.params.id, req.user?.id)) return next();
      return requirePermission(clave)(req, res, next);
    },
    `permiso.${clave}|cuenta-propia`
  );

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar cuentas
 *     description: |
 *       Todas las cuentas del sistema con su rol y estado (RF-16). Exige
 *       `puedeAdministrarUsuarios`: es el listado del panel de administración, no un
 *       directorio interno.
 *     responses:
 *       200:
 *         description: Cuentas registradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Usuario' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.get('/', requierePermisoUsuario('puedeAdministrarUsuarios'), UserController.getAll);

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear una cuenta
 *     description: |
 *       Da de alta una cuenta y **devuelve una contraseña temporal, una sola vez**. No
 *       se puede elegir la contraseña desde aquí: generarla en el servidor es lo que
 *       impide saltarse la política de composición en el alta.
 *
 *       El cuerpo es una **lista cerrada**. El caso de uso desestructuraba lo que
 *       conocía y le pasaba el resto al repositorio, así que sin esta validación el
 *       cuerpo podía escribir columnas que nadie pretendió exponer —`status`,
 *       `must_change_password`, `password_hash`—. Que la ruta sea de administrador no
 *       es un control de seguridad por sí solo.
 *
 *       **Dos capas**: `puedeAdministrarUsuarios` decide si este rol administra
 *       cuentas; `usuarios.crear` decide si esta persona en concreto puede dar altas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/NuevoUsuario' }
 *     responses:
 *       201:
 *         description: Cuenta creada. La contraseña temporal no se vuelve a mostrar.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/Usuario' }
 *                 temporalPassword: { type: string, description: Se muestra una sola vez. }
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
// `crearUsuarioSchema` es `.strict()` y ahí está lo que cierra: `createUser` le pasaba
// a Sequelize todo lo que no desestructuraba, así que el cuerpo podía escribir
// columnas que el caso de uso nunca pretendió exponer.
router.post(
  '/',
  requierePermisoUsuario('puedeAdministrarUsuarios'),
  requirePermission('usuarios.crear'),
  validarCuerpo(crearUsuarioSchema),
  UserController.create
);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Consultar una cuenta
 *     description: |
 *       Administrar cuentas, **o ser esa cuenta**. La excepción por el propio id no es
 *       un hueco: es la comprobación de propiedad que sostiene la pantalla «Mi
 *       perfil».
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: La cuenta.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.get('/:id', administraOEsSuCuenta, UserController.getById);

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     tags: [Usuarios]
 *     summary: Editar una cuenta
 *     description: |
 *       Actualización parcial. Sirve para dos cosas distintas y las distingue por
 *       quién llama:
 *
 *       - **Un administrador sobre otra cuenta**: puede cambiar rol, estado y
 *         caducidad, y pedir `reset_password` o `reset_security_questions`.
 *       - **Cualquiera sobre la suya** (pantalla «Mi perfil»): pasa sin el permiso
 *         `usuarios.editar`, porque editarse a uno mismo no es administrar usuarios.
 *         Sobre la propia cuenta rige una **lista blanca** en el caso de uso que **no**
 *         incluye ni el rol ni el estado: que un campo se acepte en el esquema no
 *         significa que esta sesión pueda escribirlo.
 *
 *       Con `reset_password` la respuesta trae la contraseña temporal nueva. Esa
 *       combinación —ruta abierta a cualquier sesión y contraseña en la respuesta— era
 *       la toma de cuenta más directa del sistema antes de cerrarla.
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CambiosUsuario' }
 *     responses:
 *       200:
 *         description: Cuenta actualizada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/Usuario' }
 *                 temporalPassword:
 *                   type: string
 *                   description: Solo cuando se pidió `reset_password`.
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.patch(
  '/:id',
  administraOEsSuCuenta,
  exigePermisoSalvoCuentaPropia('usuarios.editar'),
  validarCuerpo(actualizarUsuarioSchema),
  UserController.update
);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Eliminar una cuenta
 *     description: |
 *       **Darse de baja a uno mismo no es autoservicio** y aquí no hay excepción por
 *       cuenta propia: deja sin sujeto a la sesión que hizo la petición y es
 *       indistinguible de un borrado por error. El caso de uso lo rechaza además por
 *       su cuenta.
 *
 *       Las filas de auditoría de esa persona sobreviven al borrado: guardan una copia
 *       del nombre justamente para seguir siendo legibles cuando la cuenta ya no está.
 *     parameters:
 *       - $ref: '#/components/parameters/IdEnRuta'
 *     responses:
 *       200:
 *         description: Cuenta eliminada.
 *       400:
 *         description: Intento de borrar la propia cuenta.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
// Darse de baja a uno mismo no es autoservicio: deja la cuenta que hizo la petición
// sin sujeto y es indistinguible de un borrado por error. `deleteUser` lo rechaza
// además en el caso de uso.
router.delete(
  '/:id',
  requierePermisoUsuario('puedeAdministrarUsuarios'),
  requirePermission('usuarios.eliminar'),
  UserController.delete
);

export default router;
