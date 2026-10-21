import { Request, Response, NextFunction } from 'express';
import { guardarBorrador } from '../use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision, ErrorValidacionAccesibilidad } from '../use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../use-cases/paginas/aprobar-pagina.usecase';
import { rechazarPagina } from '../use-cases/paginas/rechazar-pagina.usecase';
import { obtenerPaginaPublica } from '../use-cases/paginas/obtener-pagina-publica.usecase';
import { obtenerIndiceBusqueda } from '../use-cases/paginas/obtener-indice-busqueda.usecase';
import { obtenerVersionEditable } from '../use-cases/paginas/obtener-version-editable.usecase';
import { listarEnRevision } from '../use-cases/paginas/listar-en-revision.usecase';
import { listarPaginasPublicadas } from '../use-cases/paginas/listar-publicadas.usecase';
import { registrarVisita } from '../use-cases/paginas/registrar-visita.usecase';
import { listarRespaldos } from '../use-cases/paginas/listar-respaldos.usecase';
import { analizarDepuracionVersiones } from '../use-cases/paginas/analizar-depuracion-versiones.usecase';
import { depurarVersiones } from '../use-cases/paginas/depurar-versiones.usecase';
import { restaurarVersionAnterior } from '../use-cases/paginas/restaurar-version-anterior.usecase';
import { eliminarVersion } from '../use-cases/paginas/eliminar-version.usecase';
import { BloqueoEdicionRepository } from '../repositories/bloqueo-edicion.repository';
import { crearSeccion } from '../use-cases/paginas/crear-seccion.usecase';
import {
  analizarEliminacion,
  eliminarSeccion,
} from '../use-cases/paginas/eliminar-seccion.usecase';
import { adquirirBloqueo } from '../use-cases/paginas/adquirir-bloqueo.usecase';
import { liberarBloqueo } from '../use-cases/paginas/liberar-bloqueo.usecase';
import { registrarSubidaPendiente } from '../use-cases/paginas/registrar-subida-pendiente.usecase';
import { descartarEdicion } from '../use-cases/paginas/descartar-edicion.usecase';
import { limpiarSubidasPendientes } from '../use-cases/paginas/limpiar-subidas-pendientes.usecase';
import { AMBITO_HEADER, exigirAmbito, resolverAmbito } from '../shared/ambito';
import { logAudit } from '../use-cases/auditoria/audit.usecase';
import { datosDeAuditoria } from '../shared/auditoria-request';
import { MOTIVO_DE_ARCHIVADO } from '../shared/auditoria-resumen';
import sequelize from '../config/database';

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
 * (`3001-intranet/src/shared/lib/api/api-client.ts`, `CABECERAS_DEL_SITIO` en
 * `3000-sitio-web/src/features/editor/model/ambito.ts`), de
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
 *
 * Desde que enviar a revisión exige el «commit», cada paso que decide sobre una
 * versión (enviar, aprobar, rechazar, descartar) registra además el campo
 * `comentario`, siempre con el mismo sentido — ver `campoComentario`.
 */
const registrar = async (
  req: Request,
  accion: 'crear' | 'actualizar' | 'enviar_revision' | 'publicar' | 'despublicar' | 'aprobar' | 'rechazar' | 'eliminar' | 'guardar_borrador' | 'autoguardar_borrador',
  resultado: any,
  campos: { campo: string; antes: unknown; despues: unknown }[],
  tx?: any
) => {
  const paginaId = resultado?.pagina?.id ?? resultado?.id;
  if (!paginaId) return;

  await logAudit({
    ...datosDeAuditoria(req),
    entidadId: paginaId,
    entidadTipo: 'pagina',
    accion,
    camposModificados: campos,
  }, tx);
};

/**
 * El comentario de cambios como campo de la bitácora.
 *
 * - `antes`: el comentario de la versión que estaba **publicada** cuando ocurrió la
 *   acción. Es lo que veía el público y contra lo que se compara la propuesta.
 * - `despues`: el comentario de la versión **sobre la que se actuó** — la que se
 *   envía, se aprueba, se rechaza o se descarta (y la que se restaura, en
 *   `restaurar-version-anterior.usecase.ts`, que registra el mismo par).
 *
 * Un sentido fijo para las cuatro acciones es lo que deja a la pantalla de auditoría
 * rotularlos siempre igual («Comentario anterior» / «Comentario después») sin tener
 * que saber de qué acción viene cada fila. `null` en cualquiera de los dos lados
 * significa «esa versión no tenía comentario»: una página que nunca se publicó, o
 * una versión anterior a la migración 029.
 */
const campoComentario = (antes: string | null | undefined, despues: string | null | undefined) => ({
  campo: 'comentario',
  antes: antes ?? null,
  despues: despues ?? null,
});

export const PaginaController = {
  /** Devuelve la versión publicada de una página (lo que ve el ciudadano), o 404. */
  async obtenerPublica(req: Request, res: Response, next: NextFunction) {
    try {
      const pagina = await obtenerPaginaPublica(req.params.slug as string, ambitoDe(req));
      if (!pagina) return res.status(404).json({ error: 'Página no encontrada' });
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.json(pagina);
    } catch (err) { next(err); }
  },

  /**
   * Construye el índice dinámico de búsqueda para las páginas publicadas
   * del ámbito solicitado ('intranet' o 'sitio').
   */
  async obtenerIndiceBusqueda(req: Request, res: Response, next: NextFunction) {
    try {
      const indice = await obtenerIndiceBusqueda(ambitoDe(req));
      res.json(indice);
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
      const seccion = await sequelize.transaction(async (tx) => {
        const result = await crearSeccion(
          titulo,
          ambitoExigidoDe(req),
          req.user?.id || '',
          req.user?.role ?? null,
          tx
        );

        await logAudit({
          ...datosDeAuditoria(req),
          entidadId: result.id,
          entidadTipo: 'pagina',
          accion: 'crear',
          camposModificados: [
            { campo: 'slug', antes: null, despues: result.slug },
            { campo: 'titulo', antes: null, despues: result.titulo },
            { campo: 'ambito', antes: null, despues: result.ambito },
            { campo: 'permiso', antes: null, despues: result.clavePermiso },
            { campo: 'roles_concedidos', antes: null, despues: result.rolesConcedidos.join(', ') },
          ],
        }, tx);
        return result;
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
      const seccion = await sequelize.transaction(async (tx) => {
        const result = await eliminarSeccion(
          req.params.slug as string,
          ambitoExigidoDe(req),
          confirmacion,
          tx
        );

        await logAudit({
          ...datosDeAuditoria(req),
          entidadId: result.id,
          entidadTipo: 'pagina',
          accion: 'eliminar',
          camposModificados: [
            { campo: 'slug', antes: result.slug, despues: null },
            { campo: 'titulo', antes: result.titulo, despues: null },
            { campo: 'ambito', antes: result.ambito, despues: null },
            { campo: 'versiones_eliminadas', antes: result.versionesEliminadas, despues: null },
            { campo: 'permiso', antes: result.clavePermiso, despues: null },
            { campo: 'permiso_retirado_a_roles', antes: result.rolesAfectados.join(', '), despues: null },
          ],
        }, tx);
        return result;
      });

      res.json(seccion);
    } catch (err) { next(err); }
  },

  /** Devuelve la versión con la que abre el editor: la indicada en `versionId` o la vigente. */
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
        usuarioNombre: req.user?.name ? (req.user.apellidos ? `${req.user.name} ${req.user.apellidos}` : req.user.name) : (req.user?.email || 'Otra persona'),
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

  /** Suelta el candado de edición que la sesión tiene sobre la página. */
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

  /** Dice quién tiene abierta la página en el editor, si alguien la tiene. */
  async consultarBloqueo(req: Request, res: Response, next: NextFunction) {
    try {
      const dueño = await BloqueoEdicionRepository.vigente(ambitoExigidoDe(req), req.params.slug as string);
      res.json({ bloqueadoPor: dueño });
    } catch (err) { next(err); }
  },

  /** Descarta el borrador en curso de la sesión y vuelve a lo que había antes. */
  async descartarEdicion(req: Request, res: Response, next: NextFunction) {
    try {
      await descartarEdicion(
        req.params.slug as string,
        req.user?.id || '',
        ambitoExigidoDe(req)
      );
      res.json({ descartado: true });
    } catch (err) { next(err); }
  },

  /**
   * Guarda el contenido del editor como borrador y lo registra en la bitácora.
   *
   * Con `automatico` es el autoguardado del editor: misma fila, con su propio verbo
   * (`autoguardar_borrador`) para que no se lea como un guardado que alguien pulsó.
   */
  async guardarBorrador(req: Request, res: Response, next: NextFunction) {
    try {
      const { contenido } = req.body;
      const automatico = req.body.automatico === true;
      const result = await sequelize.transaction(async (tx) => {
        const r = await guardarBorrador(
          req.params.slug as string,
          contenido,
          req.user?.id || '',
          ambitoExigidoDe(req),
          tx,
          { automatico }
        );
        // guardar_borrador: registra slug (puede ser primera vez que se crea la página) y la versión
        const slugAntes = r.paginaAnterior?.slug ?? null;
        const verAntes = r.versionAnterior?.numeroVersion ?? null;
        const verDespues = r.version?.numeroVersion ?? null;
        await registrar(req, automatico ? 'autoguardar_borrador' : 'guardar_borrador', r, [
          { campo: 'slug', antes: slugAntes, despues: r.pagina?.slug ?? req.params.slug },
          ...(verDespues !== undefined ? [{ campo: 'version', antes: verAntes, despues: verDespues }] : []),
          { campo: 'estado', antes: r.versionAnterior?.estado ?? null, despues: 'borrador' },
        ], tx);
        return r;
      });
      res.json(result);
    } catch (err) { next(err); }
  },

  /** Guarda lo que hay en el editor y lo envía a revisión en una sola transacción. */
  async enviarARevision(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sequelize.transaction(async (tx) => {
        // Lo que hay en el editor viaja con el envío y se guarda aquí mismo, dentro de
        // la transacción y **sin fila propia en la bitácora**.
        //
        // Antes el editor hacía dos peticiones: guardaba el borrador y luego lo enviaba.
        // Cada envío dejaba así un «guardar borrador» que nadie había pulsado, pegado al
        // envío, y si además se había guardado a mano salían dos guardados idénticos
        // seguidos. Quien audita no puede distinguir cuál decidió una persona.
        //
        // Que no deje fila no abre un hueco: este guardado solo ocurre como parte de un
        // envío, y el envío sí queda registrado con su versión y su comentario. Si el
        // envío falla —falta el comentario, no cumple accesibilidad— la transacción
        // deshace también el guardado, así que no puede quedar contenido cambiado sin
        // una fila que lo cuente. Por eso esto va aquí y no como una marca en la ruta
        // de guardar: una marca así la podría mandar cualquiera para guardar sin dejar
        // rastro.
        if (req.body.contenido !== undefined) {
          await guardarBorrador(
            req.params.slug as string,
            req.body.contenido,
            req.user?.id || '',
            ambitoExigidoDe(req),
            tx
          );
        }

        const r = await enviarARevision(
          req.params.slug as string,
          req.user?.id || '',
          ambitoExigidoDe(req),
          req.body.comentario,
          tx
        );
        // enviar_revision: lo que cambia es el estado de la versión (borrador → en_revision),
        // y el comentario es lo que explica a quien lo lea qué trae esa versión.
        await registrar(req, 'enviar_revision', r, [
          campoComentario(r.comentarioAnterior, r.version?.comentarioCambios),
          { campo: 'slug', antes: r.paginaAnterior?.slug ?? null, despues: r.pagina?.slug ?? req.params.slug },
          { campo: 'version', antes: r.versionAnterior?.numeroVersion ?? null, despues: r.version?.numeroVersion ?? null },
          { campo: 'estado', antes: r.versionAnterior?.estado ?? 'borrador', despues: 'en_revision' },
        ], tx);
        return r;
      });
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

  /** Anota un archivo recién subido al borrador para poder limpiarlo si no se usa. */
  async registrarSubida(req: Request, res: Response, next: NextFunction) {
    try {
      await registrarSubidaPendiente(
        req.params.slug as string,
        req.body.ruta,
        ambitoExigidoDe(req),
        req.user?.id
      );
      res.json({ registrada: true });
    } catch (err) { next(err); }
  },

  /** Publica la versión en revisión, archiva la anterior y deja ambas cosas en la bitácora. */
  async aprobar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aprobarPagina(
        req.params.slug as string,
        req.user?.id || '',
        ambitoExigidoDe(req)
      );

      // El comentario de lo que estaba publicado, que es lo que esta aprobación sustituye.
      const comentarioAnterior = result.versionArchivada?.comentarioCambios ?? null;

      // Si existía una versión publicada que pasa a archivada, registrar en auditoría
      if (result.versionArchivada) {
        await registrar(
          req,
          'despublicar',
          { pagina: result.pagina, version: result.versionArchivada },
          [
            // Mismo par que el de `aprobar`: la archivada es el «antes» y la que la
            // sustituye, el «después». Así las dos filas cuentan la misma transición.
            campoComentario(comentarioAnterior, result.version?.comentarioCambios),
            { campo: 'slug', antes: result.pagina?.slug ?? null, despues: result.pagina?.slug ?? null },
            { campo: 'version', antes: result.versionArchivada?.numeroVersion ?? null, despues: result.versionArchivada?.numeroVersion ?? null },
            { campo: 'estado', antes: 'publicado', despues: 'archivado' },
            { campo: 'motivo', antes: null, despues: MOTIVO_DE_ARCHIVADO.alPublicar(result.version?.numeroVersion) },
          ]
        );
      }

      // Aprobar es publicar: la versión pasa a `publicado` y queda visible. El comentario
      // del editor se registra otra vez aquí: la fila de la aprobación tiene que decir
      // qué se publicó sin obligar a buscar el envío que la precedió.
      await registrar(req, 'aprobar', result, [
        campoComentario(comentarioAnterior, result.version?.comentarioCambios),
        { campo: 'slug', antes: result.pagina?.slug ?? null, despues: result.pagina?.slug ?? null },
        { campo: 'version', antes: result.versionAnterior?.numeroVersion ?? null, despues: result.version?.numeroVersion ?? null },
        { campo: 'estado', antes: result.versionAnterior?.estado ?? 'en_revision', despues: 'publicado' },
      ]);
      res.json(result);
    } catch (err) { next(err); }
  },

  /** Devuelve la versión en revisión a borrador con su motivo, y lo registra. */
  async rechazar(req: Request, res: Response, next: NextFunction) {
    try {
      const { motivo } = req.body;
      const result = await sequelize.transaction(async (tx) => {
        const r = await rechazarPagina(
          req.params.slug as string,
          req.user?.id || '',
          motivo,
          ambitoExigidoDe(req),
          tx
        );
        // El motivo se guarda en la bitácora porque es la única explicación de por
        // qué una versión volvió a borrador, y quien la lea semanas después no
        // tiene otro sitio donde encontrarla. El comentario, porque sin él no se
        // sabe qué fue lo que se rechazó.
        await registrar(req, 'rechazar', r, [
          campoComentario(r.comentarioAnterior, r.versionAnterior?.comentarioCambios),
          { campo: 'slug', antes: r.paginaAnterior?.slug ?? null, despues: r.pagina?.slug ?? req.params.slug },
          { campo: 'version', antes: r.versionAnterior?.numeroVersion ?? null, despues: r.version?.numeroVersion ?? null },
          { campo: 'estado', antes: r.versionAnterior?.estado ?? 'en_revision', despues: 'rechazado' },
          { campo: 'motivo', antes: null, despues: motivo ?? null },
        ], tx);
        return r;
      });
      res.json(result);
    } catch (err) { next(err); }
  },

  /** Elimina una versión no publicada (y la página si era la única) y lo registra. */
  async eliminarVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const { motivo } = req.body;
      const result = await sequelize.transaction(async (tx) => {
        const r = await eliminarVersion(
          req.params.slug as string,
          req.params.versionId as string,
          ambitoExigidoDe(req),
          tx
        );
        // Descartar una versión destruye trabajo sin publicar: si la página entera
        // desaparece con ella, esta fila es lo único que queda de que existió.
        await registrar(req, 'eliminar', r, [
          campoComentario(r.comentarioAnterior, r.version?.comentarioCambios),
          { campo: 'slug', antes: r.pagina?.slug ?? req.params.slug, despues: null },
          { campo: 'version', antes: r.version?.numeroVersion ?? null, despues: null },
          { campo: 'paginaEliminada', antes: null, despues: r.paginaEliminada },
          { campo: 'motivo', antes: null, despues: motivo ?? null },
        ], tx);
        return r;
      });

      // Si la versión eliminada contenía archivos que ya no se usan en ninguna otra 
      // versión, este proceso en segundo plano los limpiará.
      if (result.pagina) {
        limpiarSubidasPendientes({
          paginaId: result.pagina.id,
          slug: req.params.slug as string,
          ambito: ambitoExigidoDe(req),
          usuarioId: req.user?.id || '',
        }).catch((err) => console.error('[Limpieza Eliminar Versión] Error limpiando subidas pendientes:', err));
      }

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

  /** Lista las páginas publicadas de los dos ámbitos, con su resumen. */
  async listarPublicadas(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await listarPaginasPublicadas());
    } catch (err) { next(err); }
  },

  /** Suma una visita a la página indicada (ruta pública, sin sesión). */
  async registrarVisita(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = (req.body?.slug || req.params?.slug || '').trim();
      const ambitoBody = req.body?.ambito;
      const ambitoHeader = req.header(AMBITO_HEADER);
      const ambito = (ambitoBody === 'intranet' || ambitoHeader === 'intranet') ? 'intranet' : 'sitio';

      const resultado = await registrarVisita({ slug, ambito });
      res.json(resultado);
    } catch (err) { next(err); }
  },

  /** Lista las versiones archivadas (respaldos) de un ámbito o de los dos. */
  async listarRespaldos(req: Request, res: Response, next: NextFunction) {
    try {
      const ambitoParam = (req.query.ambito as string) || req.header(AMBITO_HEADER);
      const ambito = ambitoParam === 'intranet' || ambitoParam === 'sitio' ? ambitoParam : undefined;
      const result = await listarRespaldos(ambito);
      res.json(result);
    } catch (err) { next(err); }
  },

  /** Vuelve a publicar una versión archivada: la indicada o la inmediatamente anterior. */
  async restaurar(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const ambito = ambitoExigidoDe(req);
      const versionId = typeof req.body?.versionId === 'string' ? req.body.versionId : undefined;
      const numeroVersion = typeof req.body?.numeroVersion === 'number' ? req.body.numeroVersion : undefined;
      const criterio = (versionId || numeroVersion) ? { versionId, numeroVersion } : undefined;
      const resultado = await restaurarVersionAnterior(
        slug,
        req.user?.id,
        ambito,
        criterio,
        datosDeAuditoria(req)
      );
      res.json(resultado);
    } catch (err) { next(err); }
  },

  /** Dice qué versiones archivadas se borrarían con estos filtros, sin borrar nada. */
  async analizarDepuracion(req: Request, res: Response, next: NextFunction) {
    try {
      const ambitoParam = (req.query.ambito as string) || req.header(AMBITO_HEADER);
      const ambito = ambitoParam === 'intranet' || ambitoParam === 'sitio' ? ambitoParam : undefined;
      const paginaId = typeof req.query.paginaId === 'string' && req.query.paginaId ? req.query.paginaId : undefined;
      const fechaCorte = typeof req.query.fechaCorte === 'string' && req.query.fechaCorte ? req.query.fechaCorte : undefined;
      const conservarUltimoRespaldo = req.query.conservarUltimoRespaldo !== 'false';

      const analisis = await analizarDepuracionVersiones({
        ambito,
        paginaId,
        fechaCorte,
        conservarUltimoRespaldo,
      });
      res.json(analisis);
    } catch (err) { next(err); }
  },

  /** Borra las versiones archivadas que cumplen los filtros, conservando siempre la última. */
  async depurarVersiones(req: Request, res: Response, next: NextFunction) {
    try {
      const { ambito: ambitoBody, paginaId, fechaCorte, conservarUltimoRespaldo } = req.body;
      const ambitoHeader = req.header(AMBITO_HEADER);
      const ambito = (ambitoBody || ambitoHeader) === 'intranet' || (ambitoBody || ambitoHeader) === 'sitio'
        ? (ambitoBody || ambitoHeader)
        : undefined;

      const resultado = await depurarVersiones(
        {
          ambito,
          paginaId: typeof paginaId === 'string' && paginaId ? paginaId : undefined,
          fechaCorte: typeof fechaCorte === 'string' && fechaCorte ? fechaCorte : undefined,
          conservarUltimoRespaldo: conservarUltimoRespaldo !== false,
        },
        datosDeAuditoria(req)
      );
      res.json(resultado);
    } catch (err) { next(err); }
  },
};
