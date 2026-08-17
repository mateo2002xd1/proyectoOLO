import { Router, type Request, type Response, type NextFunction } from 'express';
import { RoleController } from '../controllers/roles.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoUsuario } from '../middlewares/permisos.middleware';
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

router.get('/:id', administraOEsSuRol, RoleController.getById);

// El resto es la configuración de seguridad del sistema: quien crea roles o los edita
// se concede a sí mismo cualquier otra cosa. Sin filtro alguno, como estaba, bastaba
// una sesión cualquiera para fabricarse un rol con todos los permisos.
router.use(requierePermisoUsuario('puedeAdministrarSeguridad'));

router.get('/', RoleController.getAll);
router.post('/', RoleController.create);
router.patch('/:id', RoleController.update);
router.delete('/:id', RoleController.delete);

export default router;
