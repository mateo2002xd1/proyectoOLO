import { Op, Transaction } from 'sequelize';
import { ContentAuditLog } from '../infrastructure/db/models';
import type { AccionAuditable, EntidadAuditable } from '../infrastructure/db/models/content-audit-log';
import { REGLAS_POR_CATEGORIA, type CategoriaAuditoria } from '../shared/auditoria-categorias';

/** Un campo que cambió, con su valor anterior y el nuevo (RF-07). */
export interface CampoModificado {
  campo: string;
  antes: unknown;
  despues: unknown;
}

/**
 * Lo que hace falta para registrar una entrada de bitácora.
 *
 * **Este tipo es la defensa contra el bug que dejó la auditoría a cero.** El
 * `create` recibía `any`: cuando la migración 006 renombró las columnas al
 * español y tradujo los verbos de acción, quien escribía siguió mandando
 * `content_id` y `'create'` y TypeScript no dijo nada. Con `accion` atada a
 * `AccionAuditable`, mandar `'create'` en vez de `'crear'` ya no compila.
 */
export interface DatosAuditoria {
  entidadId: string;
  entidadTipo?: EntidadAuditable;
  usuarioId?: string | null;
  usuarioNombre?: string | null;
  accion: AccionAuditable;
  camposModificados?: CampoModificado[];
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Filtros de consulta de la bitácora.
 *
 * Tipados por el mismo motivo que `DatosAuditoria`: hasta ahora `findAll` recibía
 * `any` y los nombres venían del querystring en inglés (`contentType`), heredados
 * de antes de la migración 006. Con la pantalla de RF-07 consumiéndolo, un filtro
 * mal escrito debe dejar de compilar en vez de devolver la bitácora entera.
 */
export interface FiltrosAuditoria {
  pagina?: number;
  porPagina?: number;
  /** Una o varias entidades. */
  entidadTipo?: EntidadAuditable | EntidadAuditable[];
  usuarioId?: string;
  /**
   * Una o varias acciones. Varias porque una etiqueta de la pantalla puede agrupar
   * verbos distintos de la base: «Edición» son `guardar_borrador`, `enviar_revision` y
   * `actualizar`.
   */
  accion?: AccionAuditable | AccionAuditable[];
  /**
   * Las filas de una categoría de la pantalla (ver `REGLAS_POR_CATEGORIA`). Se combina
   * con `accion` y `entidadTipo` con «y»: `categoria: 'seguridad'` con
   * `accion: 'actualizar'` son las modificaciones de cuentas y roles, no las ediciones
   * de páginas, que también usan el verbo `actualizar`.
   */
  categoria?: CategoriaAuditoria;
  /** Inclusivo. */
  desde?: Date;
  /** Inclusivo: quien filtra por un día espera que ese día entre. */
  hasta?: Date;
}

/**
 * Tope de filas por petición.
 *
 * Antes `limit` viajaba del querystring al SQL sin ningún tope, así que
 * `?limit=1000000` era una petición válida contra la tabla que más crece del
 * sistema. La exportación a CSV recorre páginas en vez de pedir una gigante.
 */
export const MAX_POR_PAGINA = 200;
const POR_PAGINA_POR_DEFECTO = 50;

export const AuditRepository = {
  /**
   * Traduce del dominio (camelCase) a las columnas del modelo (snake_case).
   *
   * La traducción vive aquí y no en quien llama para que haya un solo sitio que
   * tocar la próxima vez que una migración renombre algo.
   */
  create: (datos: DatosAuditoria, tx?: Transaction) =>
    ContentAuditLog.create({
      entidad_id: datos.entidadId,
      entidad_tipo: datos.entidadTipo ?? 'contenido',
      usuario_id: datos.usuarioId ?? null,
      usuario_nombre: datos.usuarioNombre ?? null,
      accion: datos.accion,
      campos_modificados: datos.camposModificados ?? [],
      ip: datos.ip ?? null,
      user_agent: datos.userAgent ?? null,
    }, { transaction: tx }),

  findByContentId: (entidadId: string, entidadTipo?: string) => {
    const where: any = { entidad_id: entidadId };
    if (entidadTipo) where.entidad_tipo = entidadTipo;
    return ContentAuditLog.findAll({ where, order: [['created_at', 'DESC']] });
  },

  findAll: async (filtros: FiltrosAuditoria = {}) => {
    const { entidadTipo, usuarioId, accion, categoria, desde, hasta } = filtros;

    const where: Record<string, unknown> = {};
    // Un valor suelto sigue siendo `= valor` (usa el índice tal cual); solo la lista
    // se convierte en `IN`. Una lista vacía no filtra: sería `IN ()`, que no devuelve
    // nada, y quien pidió «sin filtro» no debe ver la bitácora vacía.
    const enLista = <T>(valor: T | T[] | undefined) =>
      Array.isArray(valor) ? (valor.length > 0 ? { [Op.in]: valor } : undefined) : valor;

    const entidadFiltro = enLista(entidadTipo);
    if (entidadFiltro) where.entidad_tipo = entidadFiltro;
    if (usuarioId) where.usuario_id = usuarioId;
    const accionFiltro = enLista(accion);
    if (accionFiltro) where.accion = accionFiltro;

    // `createdAt` es el nombre del atributo; el modelo va con `underscored: true`,
    // así que Sequelize lo traduce a la columna `created_at` (la que indexa
    // `idx_auditoria_fecha`).
    if (desde || hasta) {
      where.createdAt = {
        ...(desde ? { [Op.gte]: desde } : {}),
        ...(hasta ? { [Op.lte]: hasta } : {}),
      };
    }

    // Cada regla de la categoría es un «acción en (...) y entidad en (...)»; la fila entra
    // si cumple alguna (`OR`), y todo eso se suma con «y» a los demás filtros.
    const conCategoria = categoria
      ? {
          [Op.and]: [
            where,
            {
              [Op.or]: REGLAS_POR_CATEGORIA[categoria].map((regla) => ({
                accion: { [Op.in]: regla.acciones },
                ...(regla.entidades ? { entidad_tipo: { [Op.in]: regla.entidades } } : {}),
              })),
            },
          ],
        }
      : where;

    const porPagina = Math.min(Math.max(filtros.porPagina || POR_PAGINA_POR_DEFECTO, 1), MAX_POR_PAGINA);
    const pagina = Math.max(filtros.pagina || 1, 1);

    const { rows, count } = await ContentAuditLog.findAndCountAll({
      where: conCategoria,
      order: [['created_at', 'DESC']],
      limit: porPagina,
      offset: (pagina - 1) * porPagina,
    });

    return {
      registros: rows,
      total: count,
      pagina,
      porPagina,
      totalPaginas: Math.max(Math.ceil(count / porPagina), 1),
    };
  },
};
