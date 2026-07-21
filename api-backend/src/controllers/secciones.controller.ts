import { Request, Response, NextFunction } from 'express';
import {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
} from '../use-cases/contenidos/secciones.usecase';

export const SectionController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await getAllSections()); } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await getSectionById(req.params.id as string)); } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await createSection(req.body)); } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await updateSection(req.params.id as string, req.body)); } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try { res.json(await deleteSection(req.params.id as string)); } catch (err) { next(err); }
  },
};
