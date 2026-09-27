import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../config/database';
import { logAudit, type ContextoAuditoria } from './audit.usecase';

export interface ParametrosEjecutarDepuracionAuditoria {
  ids: string[];
}

export interface ResultadoDepuracionAuditoria {
  eliminadas: number;
  bytesLiberados: number;
  pesoTablaAntes: number;
  pesoTablaDespues: number;
}

/** Tamaño legible para el mensaje final: `1536` → «1.5 KB». */
function formatearBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = 2;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Borra de la bitácora los registros indicados que tengan más de 6 meses y dice cuánto se liberó.
 * La antigüedad se vuelve a comprobar aquí, dentro de la transacción: no basta con que el
 * panel los haya mostrado como antiguos.
 * @throws {Error} 400 si no llega ningún id.
 */
export async function ejecutarDepuracionAuditoria(
  params: ParametrosEjecutarDepuracionAuditoria,
  contextoAuditoria?: ContextoAuditoria
): Promise<ResultadoDepuracionAuditoria> {
  const { ids } = params;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw Object.assign(new Error('Debe proporcionar los identificadores de los registros respaldados para depurar.'), {
      status: 400,
    });
  }

  return await sequelize.transaction(async (tx: Transaction) => {

    // 1. Validar que los registros a eliminar realmente cumplan la regla de 6 meses
    const fechaCorteDate = new Date();
    fechaCorteDate.setMonth(fechaCorteDate.getMonth() - 6);
    const fechaCorteIso = fechaCorteDate.toISOString();

    const filas = await sequelize.query<{ id: string; bytes: string | number }>(
      `SELECT
         id,
         (
           COALESCE(pg_column_size(campos_modificados), 0) +
           COALESCE(pg_column_size(usuario_nombre), 0) +
           COALESCE(pg_column_size(user_agent), 0) +
           128
         )::bigint AS bytes
       FROM auditoria_cambios
       WHERE id IN (:ids)
         AND created_at <= :fechaCorte
       FOR UPDATE;`,
      {
        replacements: {
          ids,
          fechaCorte: fechaCorteIso,
        },
        type: QueryTypes.SELECT,
        transaction: tx,
      }
    );

    if (filas.length === 0) {
      return {
        eliminadas: 0,
        bytesLiberados: 0,
        pesoTablaAntes: 0,
        pesoTablaDespues: 0,
      };
    }

    const idsValidados = filas.map((f) => f.id);
    const bytesLiberados = filas.reduce((acc, f) => acc + Number(f.bytes || 0), 0);

    // 2. Medir tamaño total de la tabla en disco antes de la depuración
    const [pesoAntesRow] = await sequelize.query<{ bytes: string }>(
      `SELECT pg_total_relation_size('auditoria_cambios')::bigint AS bytes;`,
      { type: QueryTypes.SELECT, transaction: tx }
    );
    const pesoTablaAntes = Number(pesoAntesRow?.bytes || 0);

    // 3. Eliminar los registros seleccionados
    await sequelize.query(
      `DELETE FROM auditoria_cambios WHERE id IN (:ids);`,
      {
        replacements: { ids: idsValidados },
        type: QueryTypes.DELETE,
        transaction: tx,
      }
    );

    // 4. Calcular peso resultante estimado
    const pesoTablaDespues = Math.max(0, pesoTablaAntes - bytesLiberados);

    // 5. Registrar en la bitácora la acción de depuración
    if (contextoAuditoria) {
      await logAudit(
        {
          ...contextoAuditoria,
          entidadId: idsValidados[0],
          entidadTipo: 'configuracion',
          accion: 'eliminar',
          camposModificados: [
            {
              campo: 'depuracion_auditoria_peso',
              antes: formatearBytes(pesoTablaAntes),
              despues: formatearBytes(pesoTablaDespues),
            },
            {
              campo: 'registros_eliminados',
              antes: idsValidados.length,
              despues: 0,
            },
          ],
        },
        tx
      );
    }

    return {
      eliminadas: idsValidados.length,
      bytesLiberados,
      pesoTablaAntes,
      pesoTablaDespues,
    };
  });
}
