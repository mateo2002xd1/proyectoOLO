import { Request, Response, NextFunction } from 'express';
import {
  getAttachmentsByPost,
  createAttachment,
  deleteAttachment,
} from '../use-cases/contenidos/adjuntos.usecase';

export const AttachmentController = {
  async getByPost(req: Request, res: Response, next: NextFunction) {
    try { res.json(await getAttachmentsByPost(req.params.contenidoId as string)); } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await createAttachment(req.params.contenidoId as string, req.body)); } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try { res.json(await deleteAttachment(req.params.id as string)); } catch (err) { next(err); }
  },
};
