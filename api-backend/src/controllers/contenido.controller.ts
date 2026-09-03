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
// `camposDe` vivía aquí. Se movió a shared/ al empezar a auditar usuarios y roles:
// esos cuerpos sí pueden traer contraseñas, y la lista de campos que no deben
// guardarse tiene que ser una sola para todos los controladores.
import { camposDe } from '../shared/auditoria-campos';

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
      // El actor decide si el listado puede incluir borradores; el querystring solo
      // puede estrechar el resultado, nunca ampliarlo.
      res.json(await obtenerContenidos(where, req.user));
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await obtenerContenidoPorId(req.params.id as string, req.user));
    } catch (err) { next(err); }
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
      const accion = req.body?.estado === 'archivado' ? 'despublicar' : 'actualizar';
      await logAudit({
        ...datosDeAuditoria(req),
        entidadId: req.params.id as string,
        entidadTipo: 'contenido',
        accion,
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
      const result = await eliminarContenido(req.params.id as string, req.user);
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
