import { Request, Response, NextFunction } from 'express';
import { guardarBorrador } from '../use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision, ErrorValidacionAccesibilidad } from '../use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../use-cases/paginas/aprobar-pagina.usecase';
import { rechazarPagina } from '../use-cases/paginas/rechazar-pagina.usecase';
import { obtenerPaginaPublica } from '../use-cases/paginas/obtener-pagina-publica.usecase';
import { obtenerVersionEditable } from '../use-cases/paginas/obtener-version-editable.usecase';
import { listarEnRevision } from '../use-cases/paginas/listar-en-revision.usecase';
import { eliminarVersion } from '../use-cases/paginas/eliminar-version.usecase';
import { AMBITO_HEADER, exigirAmbito, resolverAmbito } from '../shared/ambito';
import { logAudit } from '../use-cases/auditoria/audit.usecase';
import { datosDeAuditoria } from '../shared/auditoria-request';

/**
 * A qué aplicación pertenece la página que se está pidiendo. Cada frontend lo
 * declara en su cliente HTTP; sin cabecera se asume el sitio público.
 */
const ambitoDe = (req: Request) => resolverAmbito(req.header(AMBITO_HEADER));

/**
 * Igual, para las operaciones que escriben o que resuelven qué se está editando.
 *
 * Aquí no vale asumir: las dos aplicaciones comparten la tabla `paginas` y ambas
 * tienen su `/inicio`, así que un ámbito equivocado no da error — da la página de la
 * otra aplicación. Los dos clientes mandan la cabecera siempre
 * (`intranet/src/shared/lib/api-client.ts`, `sitio-web/.../paginas.service.ts`), de
 * modo que exigirla no rompe a nadie y convierte en 400 lo que antes era escribir en
 * el sitio equivocado en silencio.
 */
const ambitoExigidoDe = (req: Request) => exigirAmbito(req.header(AMBITO_HEADER));

/**
 * El id que se registra en la bitácora es el de la **página**, no el de la
 * versión: RF-07 se consulta por "qué le ha pasado a esta página", y encadenar
 * versiones para reconstruir su historia sería trabajo del que lee.
 *
 * El número de versión viaja en `camposModificados` porque es lo que de verdad
 * cambió en ese paso del ciclo editorial, y así la pantalla puede decir "creó la
 * versión 4" sin consultar otra tabla.
 */
const registrar = async (
  req: Request,
  accion: 'actualizar' | 'enviar_revision' | 'publicar' | 'rechazar' | 'eliminar',
  resultado: { pagina?: { id?: string; slug?: string }; version?: { numeroVersion?: number } },
  extra: { campo: string; antes: unknown; despues: unknown }[] = []
) => {
  const paginaId = resultado?.pagina?.id;
  // Sin id no hay fila válida (`entidad_id` es NOT NULL). Es preferible no
  // registrar a tumbar la petición que sí hizo su trabajo.
  if (!paginaId) return;

  await logAudit({
    ...datosDeAuditoria(req),
    entidadId: paginaId,
    entidadTipo: 'pagina',
    accion,
    camposModificados: [
      { campo: 'slug', antes: null, despues: resultado.pagina?.slug ?? req.params.slug },
      ...(resultado.version?.numeroVersion !== undefined
        ? [{ campo: 'version', antes: null, despues: resultado.version.numeroVersion }]
        : []),
      ...extra,
    ],
  });
};

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
      const result = await obtenerVersionEditable(req.params.slug as string, ambitoExigidoDe(req));
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
        ambitoExigidoDe(req)
      );
      await registrar(req, 'actualizar', result);
      res.json(result);
    } catch (err) { next(err); }
  },

  async enviarARevision(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await enviarARevision(req.params.slug as string, ambitoExigidoDe(req));
      await registrar(req, 'enviar_revision', result);
      res.json(result);
    } catch (err) {
      // 400 con el detalle estructurado — el genérico de `errorHandler` solo
      // reenvía `message`, y el editor necesita saber *cuáles* campos faltan
      // para poder corregirlos sin adivinar.
      if (err instanceof ErrorValidacionAccesibilidad) {
        return res.status(400).json({ error: err.message, violaciones: err.violaciones });
      }
      next(err);
    }
  },

  async aprobar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aprobarPagina(
        req.params.slug as string,
        req.user?.id || '',
        ambitoExigidoDe(req)
      );
      // Aprobar es publicar: la versión pasa a `publicado` y queda visible.
      await registrar(req, 'publicar', result);
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
        ambitoExigidoDe(req)
      );
      // El motivo se guarda en la bitácora porque es la única explicación de por
      // qué una versión volvió a borrador, y quien la lea semanas después no
      // tiene otro sitio donde encontrarla.
      await registrar(req, 'rechazar', result, [
        { campo: 'motivo', antes: null, despues: motivo ?? null },
      ]);
      res.json(result);
    } catch (err) { next(err); }
  },

  async eliminarVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eliminarVersion(
        req.params.slug as string,
        req.params.versionId as string,
        ambitoExigidoDe(req)
      );
      // Descartar una versión destruye trabajo sin publicar: si la página entera
      // desaparece con ella, esta fila es lo único que queda de que existió.
      await registrar(req, 'eliminar', result, [
        { campo: 'paginaEliminada', antes: null, despues: result.paginaEliminada },
      ]);
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
