import { Request, Response, NextFunction } from 'express';
import { getAllAudit, getAuditByContentId } from '../use-cases/auditoria/audit.usecase';
import { aRegistroAuditoria, filtrosDesdeQuery } from '../shared/auditoria-dto';

/**
 * Lectura de la bitácora (RF-07).
 *
 * El controlador es quien traduce en las dos direcciones: el querystring a filtros
 * tipados (`filtrosDesdeQuery`) y las filas a la forma que consume la pantalla
 * (`aRegistroAuditoria`). Ninguna de las dos cosas baja al repositorio, que solo
 * sabe de columnas.
 */
export const AuditController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { registros, ...paginacion } = await getAllAudit(
        filtrosDesdeQuery(req.query as Record<string, unknown>)
      );

      res.json({
        registros: registros.map((fila) => aRegistroAuditoria(fila.toJSON())),
        ...paginacion,
      });
    } catch (err) { next(err); }
  },

  async getByContentId(req: Request, res: Response, next: NextFunction) {
    try {
      const { contentType, contentId } = req.params;
      const filas = await getAuditByContentId(contentId as string, contentType as string);
      res.json(filas.map((fila) => aRegistroAuditoria(fila.toJSON())));
    } catch (err) { next(err); }
  },
};
