import { Request, Response, NextFunction } from 'express';
import {
  getAllSitioUsers,
  getSitioUserById,
  createSitioUser,
  updateSitioUser,
  deleteSitioUser,
  loginSitioUser,
} from '../use-cases/usuarios/sitio-users.usecase';

export const SitioUserController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await getAllSitioUsers()); } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await getSitioUserById(req.params.id as string)); } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await createSitioUser(req.body, req.user?.id)); } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await updateSitioUser(req.params.id as string, req.body)); } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try { res.json(await deleteSitioUser(req.params.id as string)); } catch (err) { next(err); }
  },
  async login(req: Request, res: Response, next: NextFunction) {
    try { res.json(await loginSitioUser(req.body.email, req.body.password)); } catch (err) { next(err); }
  },
};
