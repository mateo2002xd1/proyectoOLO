import { Request, Response, NextFunction } from 'express';
import {
  contextoDeLectura,
  getAllAudit,
  getAuditByContentId,
} from '../use-cases/auditoria/audit.usecase';
import { aRegistroAuditoria, filtrosDesdeQuery } from '../shared/auditoria-dto';
import { analizarDepuracionAuditoria } from '../use-cases/auditoria/analizar-depuracion-auditoria.usecase';
import { ejecutarDepuracionAuditoria } from '../use-cases/auditoria/ejecutar-depuracion-auditoria.usecase';
import { datosDeAuditoria } from '../shared/auditoria-request';

/**
 * Lectura y depuración de la bitácora (RF-07).
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

      // El `toJSON` se hace una vez y se reutiliza: de esas mismas filas sale tanto lo
      // que resuelve `contextoDeLectura` como lo que se traduce después.
      const filas = registros.map((fila) => fila.toJSON());
      const contexto = await contextoDeLectura(filas);

      res.json({
        registros: filas.map((fila) => aRegistroAuditoria(fila, contexto)),
        ...paginacion,
      });
    } catch (err) { next(err); }
  },

  async getByContentId(req: Request, res: Response, next: NextFunction) {
    try {
      const { contentType, contentId } = req.params;
      const filas = (await getAuditByContentId(contentId as string, contentType as string)).map(
        (fila) => fila.toJSON()
      );
      const contexto = await contextoDeLectura(filas);

      res.json(filas.map((fila) => aRegistroAuditoria(fila, contexto)));
    } catch (err) { next(err); }
  },

  async analizarDepuracion(_req: Request, res: Response, next: NextFunction) {
    try {
      const resultado = await analizarDepuracionAuditoria();
      res.json(resultado);
    } catch (err) { next(err); }
  },

  async ejecutarDepuracion(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      const contexto = datosDeAuditoria(req);
      const resultado = await ejecutarDepuracionAuditoria({ ids }, contexto);
      res.json(resultado);
    } catch (err) { next(err); }
  },
};

