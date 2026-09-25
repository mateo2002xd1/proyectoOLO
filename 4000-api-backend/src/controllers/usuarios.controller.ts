import { Request, Response, NextFunction } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getExpirationAlerts,
  deactivateExpiredUsers,
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
  accion: 'crear' | 'actualizar' | 'eliminar' | 'inactivar',
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
    try {
      await deactivateExpiredUsers();
      res.json(await getAllUsers());
    } catch (err) { next(err); }
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
      const id = req.params.id as string;
      // Recuperar estado anterior para auditar de qué a qué cambió
      const modelAnterior = await getUserById(id).catch(() => null);
      const estadoAnterior = modelAnterior ? (typeof (modelAnterior as any).toJSON === 'function' ? (modelAnterior as any).toJSON() : modelAnterior) : null;

      // El actor viaja al caso de uso porque la ruta solo sabe *quién* llama, no *qué*
      // trae en el cuerpo: que alguien pueda editar su cuenta no significa que pueda
      // cambiarse el rol desde ella.
      const result = await updateUser(id, req.body, req.user);

      const campos = camposDe(req.body, estadoAnterior as Record<string, unknown> | null);

      // Inactivar desde el panel no es una edición más: le quita el acceso a alguien, y
      // la bitácora tiene que poder decirlo sin que quien la lea abra el detalle. Se
      // compara contra el estado anterior y no solo contra `req.body.status`: mandar
      // `status: 'inactive'` sobre una cuenta que ya lo estaba no es una inactivación
      // nueva, es un no-op, y registrarla como tal llenaría la bitácora de falsos.
      const seInactivo =
        req.body?.status === 'inactive' && (estadoAnterior as { status?: string } | null)?.status !== 'inactive';

      await registrarUsuario(req, seInactivo ? 'inactivar' : 'actualizar', id, campos);
      res.json(result);
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      // Se lee **antes** de borrar: después ya no hay a quién consultar. `entidad_id` no
      // basta, porque apunta a una cuenta que deja de existir, y la bitácora solo podía
      // decir «se eliminó una cuenta» sin saber cuál. Se guarda como «antes», con el
      // «después» vacío, que es lo que es una eliminación.
      const anterior = await getUserById(id).catch(() => null);
      const result = await deleteUser(id, req.user);
      const cuenta = anterior as { email?: string; name?: string; apellidos?: string } | null;
      await registrarUsuario(
        req,
        'eliminar',
        id,
        cuenta
          ? [
              { campo: 'email', antes: cuenta.email ?? null, despues: null },
              { campo: 'name', antes: cuenta.name ?? null, despues: null },
              { campo: 'apellidos', antes: cuenta.apellidos ?? null, despues: null },
            ]
          : []
      );
      res.json(result);
    } catch (err) { next(err); }
  },
};
