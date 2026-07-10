import { Request, Response, NextFunction } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getExpirationAlerts,
} from '../use-cases/usuarios/listar-usuarios.usecase';

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
    try { res.status(201).json(await createUser(req.body)); } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await updateUser(req.params.id as string, req.body)); } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try { res.json(await deleteUser(req.params.id as string)); } catch (err) { next(err); }
  },
};
