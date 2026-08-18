import { Request, Response, NextFunction } from 'express';
import {
  getAttachmentsByPost,
  createAttachment,
  deleteAttachment,
} from '../use-cases/contenidos/adjuntos.usecase';

/**
 * `:contenidoId` llega del prefijo con el que `app.ts` monta el router de adjuntos, y
 * el router lo ve gracias a `mergeParams`. Es el padre contra el que se comprueba la
 * pertenencia de cada archivo, así que va en las tres operaciones.
 */
export const AttachmentController = {
  async getByPost(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await getAttachmentsByPost(req.params.contenidoId as string, req.user));
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(
        await createAttachment(req.params.contenidoId as string, req.body, req.user)
      );
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(
        await deleteAttachment(req.params.contenidoId as string, req.params.id as string, req.user)
      );
    } catch (err) { next(err); }
  },
};
