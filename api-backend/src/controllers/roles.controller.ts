import { Request, Response, NextFunction } from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../use-cases/usuarios/roles.usecase';
import { logAudit } from '../use-cases/auditoria/audit.usecase';
import { datosDeAuditoria } from '../shared/auditoria-request';
import { camposDe } from '../shared/auditoria-campos';

/**
 * Un rol define qué puede hacer cada persona en el sistema: cambiarlo tiene más
 * alcance que editar cualquier página, y hasta ahora no dejaba ninguna huella.
 */
const registrarRol = (
  req: Request,
  accion: 'crear' | 'actualizar' | 'eliminar',
  rolId: string | undefined,
  campos = camposDe(req.body)
) => {
  if (!rolId) return Promise.resolve();

  return logAudit({
    ...datosDeAuditoria(req),
    entidadId: rolId,
    entidadTipo: 'rol',
    accion,
    camposModificados: campos,
  });
};

export const RoleController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await getAllRoles()); } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await getRoleById(req.params.id as string)); } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await createRole(req.body);
      await registrarRol(req, 'crear', (result as any)?.id);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const modelAnterior = await getRoleById(id).catch(() => null);
      const estadoAnterior = modelAnterior ? (typeof (modelAnterior as any).toJSON === 'function' ? (modelAnterior as any).toJSON() : modelAnterior) : null;
      
      const result = await updateRole(id, req.body);
      
      const campos = camposDe(req.body, estadoAnterior as Record<string, unknown> | null);
      await registrarRol(req, 'actualizar', id, campos);
      res.json(result);
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await deleteRole(req.params.id as string);
      await registrarRol(req, 'eliminar', req.params.id as string, []);
      res.json(result);
    } catch (err) { next(err); }
  },
};
