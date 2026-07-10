import { Request, Response, NextFunction } from 'express';
import {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from '../use-cases/usuarios/permisos.usecase';

export const PermissionController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await getAllPermissions()); } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await getPermissionById(req.params.id as string)); } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await createPermission(req.body)); } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await updatePermission(req.params.id as string, req.body)); } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try { res.json(await deletePermission(req.params.id as string)); } catch (err) { next(err); }
  },
};
