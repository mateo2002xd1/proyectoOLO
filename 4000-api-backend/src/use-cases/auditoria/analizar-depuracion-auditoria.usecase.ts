import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { aRegistroAuditoria, type RegistroAuditoria } from '../../shared/auditoria-dto';
import { contextoDeLectura } from './audit.usecase';

export interface AnalisisDepuracionAuditoriaDTO {
  /** Registros con más de un año: los que se depuran. */
  totalEncontrados: number;
  fechaCorte: string;
  /** Lo que ocupan esos registros de más de un año. */
  pesoEstimadoBytes: number;
  /** Registros del último año, que se quedan, y lo que ocupan. */
  totalUltimoAnio: number;
  pesoUltimoAnioBytes: number;
  pesoTablaBytes: number;
  registros: RegistroAuditoria[];
}

/**
 * Tamaño estimado de una fila de la bitácora: lo variable (cambios, nombre, navegador)
 * más 128 bytes por lo fijo. Lo usan el análisis y el borrado, para que den lo mismo.
 */
export const BYTES_POR_REGISTRO_SQL = `(
  COALESCE(pg_column_size(campos_modificados), 0) +
  COALESCE(pg_column_size(usuario_nombre), 0) +
  COALESCE(pg_column_size(user_agent), 0) +
  128
)::bigint`;

/**
 * Fecha de corte de la depuración: un año antes de `ahora`. Lo anterior se puede
 * borrar; el último año se conserva. La usan el análisis y el borrado, que la vuelve a
 * comprobar, así que la regla vive solo aquí.
 */
export function fechaCorteDepuracion(ahora: Date = new Date()): string {
  const corte = new Date(ahora);
  corte.setFullYear(corte.getFullYear() - 1);
  return corte.toISOString();
}

/**
 * Cuenta los registros de la bitácora con más de un año y estima cuánto ocupan, sin
 * borrar, junto con lo que ocupa el último año. Es el paso previo de la depuración: el
 * panel enseña esto antes de pedir confirmación.
 */
export async function analizarDepuracionAuditoria(): Promise<AnalisisDepuracionAuditoriaDTO> {
  // 1. Fecha de corte: un año hacia atrás desde el momento actual
  const fechaCorteIso = fechaCorteDepuracion();

  // 2. Registros de más de un año (los que se depuran) y del último año, con su peso
  const [conteoRow] = await sequelize.query<{ total: string; recientes: string; bytes_recientes: string }>(
    `SELECT
       COUNT(*) FILTER (WHERE created_at <= :fechaCorte)::bigint AS total,
       COUNT(*) FILTER (WHERE created_at > :fechaCorte)::bigint AS recientes,
       COALESCE(SUM(${BYTES_POR_REGISTRO_SQL}) FILTER (WHERE created_at > :fechaCorte), 0)::bigint AS bytes_recientes
     FROM auditoria_cambios;`,
    {
      replacements: { fechaCorte: fechaCorteIso },
      type: QueryTypes.SELECT,
    }
  );
  const totalEncontrados = Number(conteoRow?.total || 0);
  const totalUltimoAnio = Number(conteoRow?.recientes || 0);
  const pesoUltimoAnioBytes = Number(conteoRow?.bytes_recientes || 0);

  // 3. Medir peso total de la tabla en disco
  const [pesoTablaRow] = await sequelize.query<{ bytes: string }>(
    `SELECT pg_total_relation_size('auditoria_cambios')::bigint AS bytes;`,
    { type: QueryTypes.SELECT }
  );
  const pesoTablaBytes = Number(pesoTablaRow?.bytes || 0);

  if (totalEncontrados === 0) {
    return {
      totalEncontrados: 0,
      fechaCorte: fechaCorteIso,
      pesoEstimadoBytes: 0,
      totalUltimoAnio,
      pesoUltimoAnioBytes,
      pesoTablaBytes,
      registros: [],
    };
  }

  // 4. Obtener todos los candidatos a depurar (ordenados del más antiguo al más reciente)
  const filas = await sequelize.query<any>(
    `SELECT
       id,
       entidad_id,
       entidad_tipo,
       usuario_id,
       usuario_nombre,
       accion,
       campos_modificados,
       ip,
       user_agent,
       created_at,
       ${BYTES_POR_REGISTRO_SQL} AS bytes
     FROM auditoria_cambios
     WHERE created_at <= :fechaCorte
     ORDER BY created_at ASC;`,
    {
      replacements: {
        fechaCorte: fechaCorteIso,
      },
      type: QueryTypes.SELECT,
    }
  );

  const pesoEstimadoBytes = filas.reduce((acc, f) => acc + Number(f.bytes || 0), 0);
  // El mismo contexto que usa la pantalla de la bitácora: lo que se va a borrar se lee
  // con las mismas frases con que se leía antes, no en campos crudos.
  const contexto = await contextoDeLectura(filas);
  const registros = filas.map((fila) => aRegistroAuditoria(fila, contexto));

  return {
    totalEncontrados,
    fechaCorte: fechaCorteIso,
    pesoEstimadoBytes,
    totalUltimoAnio,
    pesoUltimoAnioBytes,
    pesoTablaBytes,
    registros,
  };
}

