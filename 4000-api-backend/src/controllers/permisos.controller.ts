import { Request, Response, NextFunction } from 'express';
import { getAllPermissions } from '../use-cases/usuarios/permisos.usecase';

/** Catálogo de permisos (solo lectura): lo usa el panel para asignar permisos a los roles. */
export const PermissionController = {
  /** Devuelve todas las claves concedibles, con su etiqueta y su grupo ya resueltos. */
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await getAllPermissions()); } catch (err) { next(err); }
  },
};
