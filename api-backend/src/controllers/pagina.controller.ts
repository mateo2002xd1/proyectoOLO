import { Request, Response, NextFunction } from 'express';
import { guardarBorrador } from '../use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision, ErrorValidacionAccesibilidad } from '../use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../use-cases/paginas/aprobar-pagina.usecase';
import { rechazarPagina } from '../use-cases/paginas/rechazar-pagina.usecase';
import { obtenerPaginaPublica } from '../use-cases/paginas/obtener-pagina-publica.usecase';
import { obtenerVersionEditable } from '../use-cases/paginas/obtener-version-editable.usecase';
import { listarEnRevision } from '../use-cases/paginas/listar-en-revision.usecase';
import { listarRespaldos } from '../use-cases/paginas/listar-respaldos.usecase';
import { restaurarVersionAnterior } from '../use-cases/paginas/restaurar-version-anterior.usecase';
import { eliminarVersion } from '../use-cases/paginas/eliminar-version.usecase';
import { crearSeccion } from '../use-cases/paginas/crear-seccion.usecase';
import {
  analizarEliminacion,
  eliminarSeccion,
} from '../use-cases/paginas/eliminar-seccion.usecase';
import { adquirirBloqueo } from '../use-cases/paginas/adquirir-bloqueo.usecase';
import { liberarBloqueo } from '../use-cases/paginas/liberar-bloqueo.usecase';
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
  accion: 'crear' | 'actualizar' | 'enviar_revision' | 'publicar' | 'despublicar' | 'rechazar' | 'eliminar',
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

  /**
   * Crea una sección: la fila en `paginas`, su clave de permiso y la asignación al
   * rol de quien la crea. No publica nada — ver `crear-seccion.usecase.ts`.
   *
   * El ámbito se exige, no se asume: las dos aplicaciones comparten la tabla y crear
   * la sección en la equivocada no daría error, daría una página en el otro portal.
   */
  async crearSeccion(req: Request, res: Response, next: NextFunction) {
    try {
      const { titulo } = req.body;
      const seccion = await crearSeccion(
        titulo,
        ambitoExigidoDe(req),
        req.user?.id || '',
        req.user?.role ?? null
      );

      // `registrar` espera el id de la página y aquí el use-case devuelve el slug, que
      // es lo que interesa en la bitácora. Se escribe a mano para poder dejar también
      // la clave de permiso concedida: es la parte de esta acción que reparte poder, y
      // sin ella el registro contaría solo la mitad de lo que pasó.
      await logAudit({
        ...datosDeAuditoria(req),
        entidadId: seccion.id,
        entidadTipo: 'pagina',
        accion: 'crear',
        camposModificados: [
          { campo: 'slug', antes: null, despues: seccion.slug },
          { campo: 'titulo', antes: null, despues: seccion.titulo },
          { campo: 'ambito', antes: null, despues: seccion.ambito },
          { campo: 'permiso', antes: null, despues: seccion.clavePermiso },
          { campo: 'permiso_concedido_a_rol', antes: null, despues: seccion.rolConcedido },
        ],
      });

      res.status(201).json(seccion);
    } catch (err) { next(err); }
  },

  /**
   * Qué pasaría si se borrara esta sección, sin borrar nada.
   *
   * Lo consulta el diálogo antes de pedir confirmación: cuántas versiones se pierden,
   * si está publicada, y sobre todo qué enlaces habría que quitar antes. Es una
   * consulta, así que va con el permiso de eliminar y no con el de editar — enseñar
   * dónde enlaza el portal a una ruta es información de administración.
   */
  async analizarEliminacion(req: Request, res: Response, next: NextFunction) {
    try {
      const analisis = await analizarEliminacion(
        req.params.slug as string,
        ambitoExigidoDe(req)
      );
      res.json(analisis);
    } catch (err) { next(err); }
  },

  /**
   * Borra una sección creada desde el editor.
   *
   * Las guardas —nunca una de fábrica, nada enlazando a ella, y el nombre tecleado—
   * viven en el use-case y se comprueban ahí de nuevo, no aquí: esta ruta no es el
   * único camino posible y una comprobación en el controlador se salta llamando a la
   * API desde otro cliente.
   */
  async eliminarSeccion(req: Request, res: Response, next: NextFunction) {
    try {
      const { confirmacion } = req.body;
      const seccion = await eliminarSeccion(
        req.params.slug as string,
        ambitoExigidoDe(req),
        confirmacion
      );

      // Se registra con el id que la página TENÍA. La fila ya no existe, pero la
      // bitácora no tiene clave foránea contra `paginas` justamente para esto: el
      // historial de una sección borrada sigue siendo consultable por su id.
      await logAudit({
        ...datosDeAuditoria(req),
        entidadId: seccion.id,
        entidadTipo: 'pagina',
        accion: 'eliminar',
        camposModificados: [
          { campo: 'slug', antes: seccion.slug, despues: null },
          { campo: 'titulo', antes: seccion.titulo, despues: null },
          { campo: 'ambito', antes: seccion.ambito, despues: null },
          { campo: 'versiones_eliminadas', antes: seccion.versionesEliminadas, despues: null },
          { campo: 'permiso', antes: seccion.clavePermiso, despues: null },
          { campo: 'permiso_retirado_a_roles', antes: seccion.rolesAfectados.join(', '), despues: null },
        ],
      });

      res.json(seccion);
    } catch (err) { next(err); }
  },

  async obtenerEditable(req: Request, res: Response, next: NextFunction) {
    try {
      const versionId = typeof req.query.versionId === 'string' ? req.query.versionId : undefined;
      const result = await obtenerVersionEditable(req.params.slug as string, ambitoExigidoDe(req), versionId);
      res.json(result);
    } catch (err) { next(err); }
  },

  /**
   * Pide o renueva el candado de edición de esta página.
   *
   * El 409 lleva dentro quién la tiene abierta: es lo que la pantalla necesita para
   * decir «Fulano está editando» en vez de un error genérico. Mismo patrón de
   * respuesta enriquecida que `ErrorValidacionAccesibilidad` más abajo.
   *
   * No pasa por la bitácora: se llama cada 45 segundos por cada persona que tenga el
   * editor abierto, y llenar `auditoria_cambios` de latidos taparía lo que sí importa.
   */
  async adquirirBloqueo(req: Request, res: Response, next: NextFunction) {
    try {
      const resultado = await adquirirBloqueo({
        slug: req.params.slug as string,
        ambito: ambitoExigidoDe(req),
        usuarioId: req.user?.id || '',
        // El nombre es lo que se le enseña a quien se queda fuera; el correo sirve
        // igual si la cuenta no tiene nombre puesto.
        usuarioNombre: req.user?.name || req.user?.email || 'Otra persona',
        rol: req.user?.role,
        forzar: req.body?.forzar === true,
      });

      if (!resultado.propio) {
        return res.status(409).json({
          error: `${resultado.bloqueadoPor?.nombre} está editando esta página ahora mismo.`,
          bloqueadoPor: resultado.bloqueadoPor,
          expiraEn: resultado.expiraEn,
          puedeForzar: resultado.puedeForzar,
        });
      }

      res.json(resultado);
    } catch (err) { next(err); }
  },

  async liberarBloqueo(req: Request, res: Response, next: NextFunction) {
    try {
      const resultado = await liberarBloqueo(
        req.params.slug as string,
        ambitoExigidoDe(req),
        req.user?.id || ''
      );
      res.json(resultado);
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

      // Si existía una versión publicada que pasa a archivada, registrar en auditoría
      if (result.versionArchivada) {
        await registrar(
          req,
          'despublicar',
          { pagina: result.pagina, version: result.versionArchivada },
          [
            { campo: 'estado', antes: 'publicado', despues: 'archivado' },
            { campo: 'motivo', antes: null, despues: `Archivada al publicar versión ${result.version.numeroVersion}` },
          ]
        );
      }

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

  // Sin ámbito obligatorio: lista todas las páginas o permite filtrar por ámbito si se especifica
  async listarEnRevision(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await listarEnRevision();
      res.json(result);
    } catch (err) { next(err); }
  },

  async listarRespaldos(req: Request, res: Response, next: NextFunction) {
    try {
      const ambitoParam = (req.query.ambito as string) || req.header(AMBITO_HEADER);
      const ambito = ambitoParam === 'intranet' || ambitoParam === 'sitio' ? ambitoParam : undefined;
      const result = await listarRespaldos(ambito);
      res.json(result);
    } catch (err) { next(err); }
  },

  async restaurar(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const ambito = ambitoExigidoDe(req);
      const versionId = typeof req.body?.versionId === 'string' ? req.body.versionId : undefined;
      const numeroVersion = typeof req.body?.numeroVersion === 'number' ? req.body.numeroVersion : undefined;
      const criterio = (versionId || numeroVersion) ? { versionId, numeroVersion } : undefined;
      const resultado = await restaurarVersionAnterior(slug, req.user?.id, ambito, criterio);
      res.json(resultado);
    } catch (err) { next(err); }
  },
};
