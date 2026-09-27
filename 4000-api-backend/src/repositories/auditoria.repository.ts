import { literal, Op, Transaction } from 'sequelize';
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

/**
 * Cuánto pasaba, como mucho, entre un guardado automático y el envío que lo seguía.
 *
 * Eran dos peticiones del mismo clic, una detrás de otra. Medido sobre la base el
 * 23/9/2026: de 178 envíos con un guardado delante, 169 lo tenían a menos de un segundo,
 * 7 entre uno y dos, y 2 entre dos y tres; **ninguno** entre tres y diez. Tres segundos
 * los recogen todos, y sigue siendo corto a propósito: un guardado **a mano** seguido de
 * un envío pasa por abrir el cuadro del comentario y escribir de 10 a 100 caracteres, que
 * no cabe en ese tiempo.
 */
const SEGUNDOS_ENTRE_GUARDADO_Y_ENVIO = 3;

/**
 * Los ids de los guardados que el editor hacía **solo**, un instante antes de enviar.
 *
 * Hasta la fase 6, pulsar «Enviar a revisión» hacía dos peticiones: guardar el borrador y
 * enviarlo. Cada envío dejaba así un «guardar borrador» que nadie había pulsado, y que el
 * propio envío ya cuenta: misma versión, mismo contenido, y además con el comentario.
 * Desde la fase 6 ya no se escriben —el contenido viaja con el envío—, pero los de antes
 * siguen en la tabla.
 *
 * Uno es automático si, de la misma persona y sobre la misma página, hay un envío a
 * revisión en los segundos siguientes **y ningún otro guardado entre medias**: si alguien
 * guardó a mano y el editor volvió a guardar antes de enviar, solo el segundo cuenta.
 *
 * Vive aquí, como SQL, porque la usan dos cosas que no pueden discrepar: los listados, que
 * los excluyen, y el análisis de la depuración, que los sigue nombrando por lo que son.
 * El número se interpola porque es una constante de este archivo, nunca un dato de fuera.
 */
export const SQL_IDS_GUARDADOS_AUTOMATICOS = `
  SELECT g.id
    FROM auditoria_cambios g
   WHERE g.entidad_tipo = 'pagina'
     AND g.accion = 'guardar_borrador'
     AND EXISTS (
       SELECT 1
         FROM auditoria_cambios e
        WHERE e.entidad_tipo = 'pagina'
          AND e.entidad_id = g.entidad_id
          AND e.accion = 'enviar_revision'
          AND e.usuario_id IS NOT DISTINCT FROM g.usuario_id
          AND e.created_at >= g.created_at
          AND e.created_at <= g.created_at + interval '${SEGUNDOS_ENTRE_GUARDADO_Y_ENVIO} seconds'
          AND NOT EXISTS (
            SELECT 1
              FROM auditoria_cambios g2
             WHERE g2.entidad_tipo = 'pagina'
               AND g2.entidad_id = g.entidad_id
               AND g2.accion = 'guardar_borrador'
               AND g2.created_at > g.created_at
               AND g2.created_at <= e.created_at
          )
     )`;

/**
 * La condición que deja fuera de un listado los guardados automáticos.
 *
 * **Decisión del usuario (23/9/2026):** no se enseñan. El envío que va detrás los
 * sustituye —dice la misma versión y además trae el comentario—, y verlos al lado solo
 * confundía a quien audita: parecían dos guardados donde se había pulsado uno.
 *
 * **No se borran.** Siguen en la tabla, y la depuración de seis meses se los lleva igual
 * que al resto: por eso el análisis previo a depurar sí los cuenta y los enseña. Quitarlos
 * de la base habría sido destruir evidencia para arreglar algo que era de lectura.
 *
 * Se aplica también al total, así que la paginación cuadra: no quedan páginas cortas.
 */
const sinGuardadosAutomaticos = () => ({
  id: { [Op.notIn]: literal(`(${SQL_IDS_GUARDADOS_AUTOMATICOS})`) },
});

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

  /** Historial de una entidad concreta (más reciente primero), sin los guardados automáticos. */
  findByContentId: (entidadId: string, entidadTipo?: string) => {
    const where: any = { entidad_id: entidadId, ...sinGuardadosAutomaticos() };
    if (entidadTipo) where.entidad_tipo = entidadTipo;
    return ContentAuditLog.findAll({ where, order: [['created_at', 'DESC']] });
  },

  /**
   * Registros de la bitácora que cumplen los filtros, paginados y sin los guardados automáticos.
   */
  findAll: async (filtros: FiltrosAuditoria = {}) => {
    const { entidadTipo, usuarioId, accion, categoria, desde, hasta } = filtros;

    const where: Record<string, unknown> = { ...sinGuardadosAutomaticos() };
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
