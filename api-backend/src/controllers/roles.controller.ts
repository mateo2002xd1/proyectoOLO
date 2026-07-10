import { Request, Response, NextFunction } from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../use-cases/usuarios/roles.usecase';

export const RoleController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await getAllRoles()); } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await getRoleById(req.params.id as string)); } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await createRole(req.body)); } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await updateRole(req.params.id as string, req.body)); } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try { res.json(await deleteRole(req.params.id as string)); } catch (err) { next(err); }
  },
};
