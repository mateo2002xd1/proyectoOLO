import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { aRegistroAuditoria, type RegistroAuditoria } from '../../shared/auditoria-dto';

export interface AnalisisDepuracionAuditoriaDTO {
  totalEncontrados: number;
  fechaCorte: string;
  pesoEstimadoBytes: number;
  pesoTablaBytes: number;
  registros: RegistroAuditoria[];
}

export async function analizarDepuracionAuditoria(): Promise<AnalisisDepuracionAuditoriaDTO> {
  // 1. Fecha de corte: 6 meses hacia atrás desde el momento actual
  const fechaCorteDate = new Date();
  fechaCorteDate.setMonth(fechaCorteDate.getMonth() - 6);
  const fechaCorteIso = fechaCorteDate.toISOString();

  // 2. Conteo total de registros con más de 6 meses de antigüedad
  const [conteoRow] = await sequelize.query<{ total: string }>(
    `SELECT COUNT(*)::bigint AS total
     FROM auditoria_cambios
     WHERE created_at <= :fechaCorte;`,
    {
      replacements: { fechaCorte: fechaCorteIso },
      type: QueryTypes.SELECT,
    }
  );
  const totalEncontrados = Number(conteoRow?.total || 0);

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
       (
         COALESCE(pg_column_size(campos_modificados), 0) +
         COALESCE(pg_column_size(usuario_nombre), 0) +
         COALESCE(pg_column_size(user_agent), 0) +
         128
       )::bigint AS bytes
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
  const registros = filas.map((fila) => aRegistroAuditoria(fila));

  return {
    totalEncontrados,
    fechaCorte: fechaCorteIso,
    pesoEstimadoBytes,
    pesoTablaBytes,
    registros,
  };
}

