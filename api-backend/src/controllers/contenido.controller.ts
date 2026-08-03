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
import { datosDeAuditoria } from '../shared/auditoria-request';

/**
 * Convierte el cuerpo de la petición en la lista de campos modificados.
 *
 * `antes` va en `null` porque el controlador no tiene el estado anterior: para
 * que diga de verdad "de X a Y" hace falta que el use-case devuelva la versión
 * previa (T-07.6, pendiente). Se deja explícito en vez de omitirlo para que el
 * hueco se vea en los datos y no se confunda con "no cambió nada".
 */
const camposDe = (body: Record<string, unknown>) =>
  Object.keys(body ?? {}).map((campo) => ({ campo, antes: null, despues: body[campo] }));

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
      await logAudit({
        ...datosDeAuditoria(req),
        entidadId: (result as any).id,
        entidadTipo: 'contenido',
        accion: 'crear',
        camposModificados: camposDe(req.body),
      });
      res.status(201).json(result);
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await actualizarContenido(req.params.id as string, req.body);
      await logAudit({
        ...datosDeAuditoria(req),
        entidadId: req.params.id as string,
        entidadTipo: 'contenido',
        accion: 'actualizar',
        camposModificados: camposDe(req.body),
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
      await logAudit({
        ...datosDeAuditoria(req),
        entidadId: req.params.id as string,
        entidadTipo: 'contenido',
        accion: 'eliminar',
      });
      res.json(result);
    } catch (err) { next(err); }
  },
};
