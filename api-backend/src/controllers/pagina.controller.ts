import { Request, Response, NextFunction } from 'express';
import { guardarBorrador } from '../use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision } from '../use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../use-cases/paginas/aprobar-pagina.usecase';
import { rechazarPagina } from '../use-cases/paginas/rechazar-pagina.usecase';
import { obtenerPaginaPublica } from '../use-cases/paginas/obtener-pagina-publica.usecase';
import { obtenerVersionEditable } from '../use-cases/paginas/obtener-version-editable.usecase';
import { listarEnRevision } from '../use-cases/paginas/listar-en-revision.usecase';
import { eliminarVersion } from '../use-cases/paginas/eliminar-version.usecase';
import { AMBITO_HEADER, resolverAmbito } from '../shared/ambito';

/**
 * A qué aplicación pertenece la página que se está pidiendo. Cada frontend lo
 * declara en su cliente HTTP; sin cabecera se asume el sitio público.
 */
const ambitoDe = (req: Request) => resolverAmbito(req.header(AMBITO_HEADER));

export const PaginaController = {
  async obtenerPublica(req: Request, res: Response, next: NextFunction) {
    try {
      const pagina = await obtenerPaginaPublica(req.params.slug as string, ambitoDe(req));
      if (!pagina) return res.status(404).json({ error: 'Página no encontrada' });
      res.json(pagina);
    } catch (err) { next(err); }
  },

  async obtenerEditable(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await obtenerVersionEditable(req.params.slug as string, ambitoDe(req));
      res.json(result);
    } catch (err) { next(err); }
  },

  async guardarBorrador(req: Request, res: Response, next: NextFunction) {
    try {
      const { contenido } = req.body;
      const result = await guardarBorrador(
        req.params.slug as string,
        contenido,
        req.user?.id || '',
        ambitoDe(req)
      );
      res.json(result);
    } catch (err) { next(err); }
  },

  async enviarARevision(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await enviarARevision(req.params.slug as string, ambitoDe(req));
      res.json(result);
    } catch (err) { next(err); }
  },

  async aprobar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aprobarPagina(req.params.slug as string, req.user?.id || '', ambitoDe(req));
      res.json(result);
    } catch (err) { next(err); }
  },

  async rechazar(req: Request, res: Response, next: NextFunction) {
    try {
      const { motivo } = req.body;
      const result = await rechazarPagina(
        req.params.slug as string,
        req.user?.id || '',
        motivo,
        ambitoDe(req)
      );
      res.json(result);
    } catch (err) { next(err); }
  },

  async eliminarVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eliminarVersion(
        req.params.slug as string,
        req.params.versionId as string,
        ambitoDe(req)
      );
      res.json(result);
    } catch (err) { next(err); }
  },

  // Sin ámbito: la cola de aprobación reúne las dos aplicaciones en un solo sitio.
  async listarEnRevision(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await listarEnRevision();
      res.json(result);
    } catch (err) { next(err); }
  },
};
