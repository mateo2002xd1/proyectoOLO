import { Request, Response, NextFunction } from 'express';
import {
  obtenerContenidos,
  obtenerContenidoPorId,
  crearContenido,
  actualizarContenido,
  buscarContenidoGlobal,
  eliminarContenido,
} from '../use-cases/contenidos/contenido.usecase';
import { logAudit } from '../use-cases/auditoria/audit.usecase';

export const ContenidoController = {
  async listarPublicados(req: Request, res: Response, next: NextFunction) {
    try {
      const { Op } = require('sequelize');
      const where: any = { publishedAt: { [Op.ne]: null } };
      if (req.query.sectionId) where.sectionId = req.query.sectionId;
      res.json(await obtenerContenidos(where));
    } catch (err) { next(err); }
  },
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const where: any = {};
      if (req.query.sectionId) where.sectionId = req.query.sectionId;
      if (req.query.published === 'true') {
        const { Op } = require('sequelize');
        where.publishedAt = { [Op.ne]: null };
      }
      res.json(await obtenerContenidos(where));
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await obtenerContenidoPorId(req.params.id as string)); } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await crearContenido(req.body, req.user?.id);
      logAudit({
        contentId: (result as any).id,
        contentType: 'contenido',
        userId: req.user?.id,
        userName: req.user?.name || req.user?.email,
        actionType: 'create',
        modifiedFields: Object.keys(req.body).map((k) => ({ field: k, old: null, new: req.body[k] })),
      });
      res.status(201).json(result);
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await actualizarContenido(req.params.id as string, req.body);
      logAudit({
        contentId: req.params.id as string,
        contentType: 'contenido',
        userId: req.user?.id,
        userName: req.user?.name || req.user?.email,
        actionType: 'update',
        modifiedFields: Object.keys(req.body).map((k) => ({ field: k, old: null, new: req.body[k] })),
      });
      res.json(result);
    } catch (err) { next(err); }
  },
  async globalLookup(req: Request, res: Response, next: NextFunction) {
    try { res.json(await buscarContenidoGlobal(req.query.term as string)); } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eliminarContenido(req.params.id as string);
      logAudit({
        contentId: req.params.id as string,
        contentType: 'contenido',
        userId: req.user?.id,
        userName: req.user?.name || req.user?.email,
        actionType: 'delete',
        modifiedFields: [],
      });
      res.json(result);
    } catch (err) { next(err); }
  },
};
