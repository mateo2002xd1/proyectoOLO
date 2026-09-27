import { Request, Response, NextFunction } from 'express';
import { contextoDeLectura, getAllAudit } from '../use-cases/auditoria/audit.usecase';
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
  /**
   * Lista la bitácora con los filtros del querystring, paginada y ya traducida para la pantalla.
   */
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

  /** Dice cuántos registros de la bitácora se podrían depurar y cuánto ocupan, sin borrar nada. */
  async analizarDepuracion(_req: Request, res: Response, next: NextFunction) {
    try {
      const resultado = await analizarDepuracionAuditoria();
      res.json(resultado);
    } catch (err) { next(err); }
  },

  /** Borra de la bitácora los registros indicados y deja constancia de quién lo hizo. */
  async ejecutarDepuracion(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      const contexto = datosDeAuditoria(req);
      const resultado = await ejecutarDepuracionAuditoria({ ids }, contexto);
      res.json(resultado);
    } catch (err) { next(err); }
  },
};

