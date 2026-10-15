import { Op, QueryTypes, Transaction } from 'sequelize';
import sequelize from '../config/database';
import { Pagina, PaginaVersion, User } from '../infrastructure/db/models';
import type { Ambito } from '../shared/ambito';

export const PaginaRepository = {
  // El slug solo identifica una página dentro de su ámbito: el sitio y la intranet
  // tienen cada uno su `/inicio`. Buscar por slug a secas devolvía la página de la
  // otra aplicación.
  findBySlug: (slug: string, ambito: Ambito, tx?: Transaction) => Pagina.findOne({ where: { slug, ambito }, transaction: tx }),

  /** Slug y ámbito de varias páginas en una consulta: la bitácora los pide por lote. */
  findRutasByIds: (ids: string[]) =>
    Pagina.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id', 'slug', 'ambito'],
    }),

  /** Crea la fila de una página nueva. */
  crear: (data: any, tx?: Transaction) => Pagina.create(data, { transaction: tx }),

  /** Actualiza los datos de una página ya cargada. */
  actualizarPagina: (pagina: Pagina, data: any, tx?: Transaction) => pagina.update(data, { transaction: tx }),

  /** La versión con el número más alto de una página, sea cual sea su estado. */
  findUltimaVersion: (paginaId: string, tx?: Transaction) =>
    PaginaVersion.findOne({
      where: { paginaId },
      order: [['numeroVersion', 'DESC']],
      transaction: tx,
    }),

  /** La versión más reciente de una página en el estado indicado, o `null`. */
  findVersionPorEstado: (paginaId: string, estado: string, tx?: Transaction) =>
    PaginaVersion.findOne({
      where: { paginaId, estado },
      order: [['numeroVersion', 'DESC']],
      transaction: tx,
    }),

  /** Crea una versión nueva de una página. */
  crearVersion: (data: any, tx?: Transaction) => PaginaVersion.create(data, { transaction: tx }),

  /**
   * Archiva la versión publicada vigente de una página. Debe llamarse antes de
   * publicar la siguiente: el índice `uq_pagina_version_publicada` solo admite una
   * versión en estado 'publicado' por página.
   */
  archivarVersionPublicada: (paginaId: string, tx?: Transaction) =>
    PaginaVersion.update({ estado: 'archivado' }, { where: { paginaId, estado: 'publicado' }, transaction: tx }),

  /** Actualiza una versión ya cargada (contenido, estado, autoría…). */
  actualizarVersion: (version: PaginaVersion, data: any, tx?: Transaction) => version.update(data, { transaction: tx }),

  /** Borra una versión. */
  eliminarVersion: (version: PaginaVersion, tx?: Transaction) => version.destroy({ transaction: tx }),

  /** Cuántas versiones tiene una página. */
  contarVersiones: (paginaId: string, tx?: Transaction) => PaginaVersion.count({ where: { paginaId }, transaction: tx }),

  /** Borra una página (sus versiones caen en cascada). */
  eliminarPagina: (pagina: Pagina, tx?: Transaction) => pagina.destroy({ transaction: tx }),

  /** Una versión por su id, o `null`. */
  findVersionPorId: (id: string, tx?: Transaction) => PaginaVersion.findByPk(id, { transaction: tx }),

  // La cola de revisión es única para las dos aplicaciones: quien aprueba lo hace
  // desde el panel del sitio y ahí debe ver también lo que llega de la intranet.
  // Cada versión viaja con el ámbito de su página para saber sobre cuál se actúa.
  listarEnRevision: (tx?: Transaction) =>
    PaginaVersion.findAll({
      where: { estado: 'en_revision' },
      include: [
        {
          model: Pagina,
          as: 'pagina',
          required: true,
          include: [
            { model: User, as: 'creador', attributes: ['id', 'name', 'apellidos', 'email'] },
          ],
        },
        { model: User, as: 'autor', attributes: ['id', 'name', 'apellidos', 'email'] },
      ],
      order: [['creadoEn', 'DESC']],
      transaction: tx,
    }),

  /**
   * Las páginas que están publicadas ahora mismo, de los dos ámbitos.
   *
   * El criterio es `versionPublicadaId != null` y no «tiene alguna versión en estado
   * publicado»: esa columna es la que decide qué sirve el portal, y la base impone que
   * haya como mucho una. Buscar por el estado de las versiones habría contado también
   * las archivadas de páginas que ya no publican nada.
   *
   * Sin `include` a propósito: `versionPublicada` está declarado en el modelo pero **no
   * tiene asociación** (`models/index.ts` solo define `versiones`), así que pedirlo
   * reventaría en ejecución. Para contar y enlazar bastan slug, título y ámbito.
   */
  listarPublicadas: (tx?: Transaction) =>
    Pagina.findAll({
      where: { versionPublicadaId: { [Op.ne]: null } },
      attributes: ['id', 'slug', 'titulo', 'ambito', 'visitas'],
      order: [['ambito', 'ASC'], ['titulo', 'ASC']],
      transaction: tx,
    }),

  /**
   * Suma una visita en una sola sentencia atómica. Antes eran tres idas a la base
   * (buscar, incrementar, releer) y un `increment` sobre una instancia cargada, que
   * con visitas simultáneas pisaba el valor de otra. Devuelve el nuevo total, o
   * `null` si la página no existe.
   */
  incrementarVisitas: async (slug: string, ambito: string, tx?: Transaction): Promise<number | null> => {
    const filas = await sequelize.query<{ visitas: number }>(
      'UPDATE paginas SET visitas = visitas + 1 WHERE slug = :slug AND ambito = :ambito RETURNING visitas',
      { replacements: { slug, ambito }, type: QueryTypes.SELECT, transaction: tx }
    );
    return filas.length ? Number(filas[0].visitas) : null;
  },

  /**
   * De estas rutas de `/uploads/`, las que alguna versión —en cualquier estado— de alguna
   * página del ámbito todavía nombra en su contenido o su layout. Es la única respuesta a
   * «¿se puede borrar o mover este archivo?»: la usan `borrarArchivosHuerfanos` y, con
   * `excluirPaginaId`, publicar y restaurar, para no sacar de `uploads/` lo que otra
   * página enlaza.
   *
   * Busca el texto de la ruta en el JSON, como la primera versión de
   * `limpiarSubidasPendientes` (que hacía una consulta por archivo): así cuenta cualquier
   * bloque, sepa o no dónde guarda sus archivos. `strpos` y no `LIKE` para que un `_` o un
   * `%` en el nombre no hagan de comodín. Cada ruta se busca también codificada
   * (`mi%20foto.png`), porque `extraerRutasUploads` las devuelve descodificadas.
   *
   * `MATERIALIZED` convierte cada versión a texto una sola vez para todas las rutas.
   */
  rutasEnUso: async (
    rutas: string[],
    ambito: Ambito,
    opciones: { excluirPaginaId?: string; tx?: Transaction } = {}
  ): Promise<Set<string>> => {
    if (rutas.length === 0) return new Set();

    const filas = await sequelize.query<{ ruta: string }>(
      `WITH textos AS MATERIALIZED (
         SELECT v.contenido::text || ' ' || COALESCE(v.layout::text, '') AS texto
           FROM paginas_versiones v
           JOIN paginas p ON p.id = v.pagina_id
          WHERE p.ambito = :ambito
            AND (CAST(:excluir AS uuid) IS NULL OR p.id <> CAST(:excluir AS uuid))
       )
       SELECT r.ruta
         FROM unnest(ARRAY[:rutas]::text[], ARRAY[:codificadas]::text[]) AS r(ruta, codificada)
        WHERE EXISTS (
          SELECT 1 FROM textos t
           WHERE strpos(t.texto, r.ruta) > 0 OR strpos(t.texto, r.codificada) > 0
        )`,
      {
        replacements: {
          ambito,
          excluir: opciones.excluirPaginaId ?? null,
          rutas,
          codificadas: rutas.map((r) => encodeURI(r)),
        },
        type: QueryTypes.SELECT,
        transaction: opciones.tx,
      }
    );

    return new Set(filas.map((f) => f.ruta));
  },
};
