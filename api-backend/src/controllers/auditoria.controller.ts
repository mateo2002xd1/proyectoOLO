import { Request, Response, NextFunction } from 'express';
import { getAllAudit, getAuditByContentId } from '../use-cases/auditoria/audit.usecase';

export const AuditController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, contentType, userId, actionType } = req.query;
      res.json(await getAllAudit({
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 50,
        contentType,
        userId,
        actionType,
      }));
    } catch (err) { next(err); }
  },

  async getByContentId(req: Request, res: Response, next: NextFunction) {
    try {
      const { contentType, contentId } = req.params;
      res.json(await getAuditByContentId(contentId as string, contentType as string));
    } catch (err) { next(err); }
  },
};
