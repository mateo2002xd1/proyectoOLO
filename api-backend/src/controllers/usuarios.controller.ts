import { Request, Response, NextFunction } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getExpirationAlerts,
} from '../use-cases/usuarios/listar-usuarios.usecase';
import { logAudit } from '../use-cases/auditoria/audit.usecase';
import { datosDeAuditoria } from '../shared/auditoria-request';
import { camposDe } from '../shared/auditoria-campos';

/**
 * Lo que se registra es **el cuerpo de la petición**, nunca la respuesta.
 *
 * `createUser` y `updateUser` devuelven `temporaryPassword` cuando generan una
 * clave nueva: registrar el resultado dejaría esa clave escrita en la bitácora, que
 * es la tabla equivocada donde tenerla. Del cuerpo, `camposDe` ya sustituye el
 * valor de los campos sensibles.
 */
const registrarUsuario = (
  req: Request,
  accion: 'crear' | 'actualizar' | 'eliminar',
  usuarioAfectadoId: string | undefined,
  campos = camposDe(req.body)
) => {
  // Sin id no hay fila válida (`entidad_id` es NOT NULL): mejor no registrar que
  // tumbar una petición que ya hizo su trabajo.
  if (!usuarioAfectadoId) return Promise.resolve();

  return logAudit({
    ...datosDeAuditoria(req),
    entidadId: usuarioAfectadoId,
    entidadTipo: 'usuario',
    accion,
    camposModificados: campos,
  });
};

export const UserController = {
  async getExpirationAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const windowDaysRaw = Number.parseInt(String(req.query.windowDays ?? '7'), 10);
      const windowDays = Number.isNaN(windowDaysRaw) ? 7 : Math.max(1, Math.min(windowDaysRaw, 30));
      res.json(await getExpirationAlerts(windowDays));
    } catch (err) { next(err); }
  },

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await getAllUsers()); } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await getUserById(req.params.id as string)); } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await createUser(req.body);
      await registrarUsuario(req, 'crear', (result as any)?.id);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await updateUser(req.params.id as string, req.body);
      await registrarUsuario(req, 'actualizar', req.params.id as string);
      res.json(result);
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await deleteUser(req.params.id as string);
      // En un borrado el cuerpo viene vacío; lo que importa es sobre quién se hizo,
      // y eso ya va en `entidad_id`.
      await registrarUsuario(req, 'eliminar', req.params.id as string, []);
      res.json(result);
    } catch (err) { next(err); }
  },
};
