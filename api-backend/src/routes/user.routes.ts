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

    if (usuariosPolicies.puedeAdministrarUsuarios(req.user.role)) return next();
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

router.get('/', requierePermisoUsuario('puedeAdministrarUsuarios'), UserController.getAll);
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

router.get('/:id', administraOEsSuCuenta, UserController.getById);
router.patch(
  '/:id',
  administraOEsSuCuenta,
  exigePermisoSalvoCuentaPropia('usuarios.editar'),
  validarCuerpo(actualizarUsuarioSchema),
  UserController.update
);

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
