import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../config/database';
import type { Ambito } from '../../shared/ambito';
import { logAudit, type ContextoAuditoria } from '../auditoria/audit.usecase';
import { BloqueoEdicionRepository } from '../../repositories/bloqueo-edicion.repository';

export interface ParametrosDepuracionVersiones {
  ambito?: Ambito;
  paginaId?: string;
  fechaCorte?: string; // ISO YYYY-MM-DD opcional
  /** Lo manda el panel, pero se ignora: la última versión archivada se conserva siempre. */
  conservarUltimoRespaldo?: boolean;
}

export interface ResultadoDepuracion {
  eliminadas: number;
  paginasAfectadas: number;
  bytesLiberados: number;
  pesoTablaAntes?: number;
  pesoTablaDespues?: number;
}

/**
 * Borra las versiones archivadas que cumplen los filtros, dentro de una transacción, y lo registra.
 * La última archivada de cada página se conserva siempre para poder volver atrás.
 */
export async function depurarVersiones(
  params: ParametrosDepuracionVersiones,
  contextoAuditoria?: ContextoAuditoria
): Promise<ResultadoDepuracion> {
  let fechaCorteIso: string | null = null;
  if (params.fechaCorte) {
    const fechaCorteDate = new Date(`${params.fechaCorte}T23:59:59.999Z`);
    if (!isNaN(fechaCorteDate.getTime())) {
      fechaCorteIso = fechaCorteDate.toISOString();
    }
  }

  // Regla invariable: SIEMPRE se conserva la última versión archivada para permitir rollback.
  // Está escrita en el SQL (`ultima_archivada`), no en una variable.

  return await sequelize.transaction(async (tx: Transaction) => {
    // 1. Identificar las versiones que cumplen exactamente los criterios
    const sqlBuscar = `
      WITH ultima_archivada AS (
        SELECT DISTINCT ON (pagina_id) id
        FROM paginas_versiones
        WHERE estado = 'archivado'
        ORDER BY pagina_id, publicado_en DESC NULLS LAST, numero_version DESC
      )
      SELECT
        pv.id AS version_id,
        pv.pagina_id,
        p.slug,
        p.ambito,
        (
          pg_column_size(pv.contenido) +
          COALESCE(pg_column_size(pv.layout), 0) +
          COALESCE(pg_column_size(pv.motivo_rechazo), 0) +
          COALESCE(pg_column_size(pv.comentario_cambios), 0) +
          64
        )::bigint AS bytes
      FROM paginas_versiones pv
      INNER JOIN paginas p ON p.id = pv.pagina_id
      WHERE pv.estado = 'archivado'
        AND pv.id != COALESCE(p.version_publicada_id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (:ambito::text IS NULL OR p.ambito = :ambito)
        AND (:paginaId::uuid IS NULL OR p.id = :paginaId)
        AND (:fechaCorte::timestamptz IS NULL OR pv.creado_en <= :fechaCorte)
        AND pv.id NOT IN (SELECT id FROM ultima_archivada)
      ORDER BY pv.creado_en ASC
      FOR UPDATE OF pv;
    `;

    const filas = await sequelize.query<{
      version_id: string;
      pagina_id: string;
      slug: string;
      ambito: Ambito;
      bytes: string | number;
    }>(sqlBuscar, {
      replacements: {
        ambito: params.ambito || null,
        paginaId: params.paginaId || null,
        fechaCorte: fechaCorteIso,
      },
      type: QueryTypes.SELECT,
      transaction: tx,
    });

    if (filas.length === 0) {
      return { eliminadas: 0, paginasAfectadas: 0, bytesLiberados: 0 };
    }

    // 2. Validar que ninguna página con versiones a depurar esté bloqueada en edición
    const paginasUnicas = Array.from(
      new Set(filas.map((f) => JSON.stringify({ slug: f.slug, ambito: f.ambito })))
    ).map((s) => JSON.parse(s) as { slug: string; ambito: Ambito });

    for (const pag of paginasUnicas) {
      const bloqueo = await BloqueoEdicionRepository.vigente(pag.ambito, pag.slug);
      if (bloqueo) {
        throw Object.assign(
          new Error(
            `No se puede depurar porque la página "${pag.slug}" (${pag.ambito}) está siendo editada por ${bloqueo.usuario_nombre}.`
          ),
          { status: 409 }
        );
      }
    }

function formatearBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = 2;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

    const idsParaEliminar = filas.map((f) => f.version_id);
    const bytesTotales = filas.reduce((acc, f) => acc + Number(f.bytes), 0);

    // 3. Medir el peso total de los datos de la tabla antes de la depuración
    const [pesoAntesRow] = await sequelize.query<{ bytes: string }>(
      `SELECT COALESCE(SUM(
        pg_column_size(pv.contenido) +
        COALESCE(pg_column_size(pv.layout), 0) +
        COALESCE(pg_column_size(pv.motivo_rechazo), 0) +
        COALESCE(pg_column_size(pv.comentario_cambios), 0) +
        64
      ), 0)::bigint AS bytes
      FROM paginas_versiones pv;`,
      { type: QueryTypes.SELECT, transaction: tx }
    );
    const bytesTablaAntes = Number(pesoAntesRow?.bytes || 0);

    // 4. Ejecutar eliminación
    await sequelize.query(
      `DELETE FROM paginas_versiones WHERE id IN (:ids);`,
      {
        replacements: { ids: idsParaEliminar },
        type: QueryTypes.DELETE,
        transaction: tx,
      }
    );

    const bytesTablaDespues = Math.max(0, bytesTablaAntes - bytesTotales);

    // 5. Registrar en la bitácora de auditoría solo el peso antes y el peso resultante de la tabla
    if (contextoAuditoria) {
      await logAudit(
        {
          ...contextoAuditoria,
          entidadId: filas[0].pagina_id,
          entidadTipo: 'pagina',
          accion: 'eliminar',
          camposModificados: [
            {
              campo: 'peso_tabla',
              antes: formatearBytes(bytesTablaAntes),
              despues: formatearBytes(bytesTablaDespues),
            },
          ],
        },
        tx
      );
    }

    return {
      eliminadas: idsParaEliminar.length,
      paginasAfectadas: paginasUnicas.length,
      bytesLiberados: bytesTotales,
      pesoTablaAntes: bytesTablaAntes,
      pesoTablaDespues: bytesTablaDespues,
    };
  });
}
