import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../config/database';
import type { Ambito } from '../../shared/ambito';
import { logAudit, type ContextoAuditoria } from '../auditoria/audit.usecase';
import { BloqueoEdicionRepository } from '../../repositories/bloqueo-edicion.repository';

export interface ParametrosDepuracionVersiones {
  ambito?: Ambito;
  paginaId?: string;
  fechaCorte: string; // ISO YYYY-MM-DD
  conservarUltimoRespaldo?: boolean;
}

export interface ResultadoDepuracion {
  eliminadas: number;
  paginasAfectadas: number;
  bytesLiberados: number;
}

const LIMITE_DIAS_SEGURIDAD = 30;
// Límite quemado solicitado para pruebas seguras
export const LIMITE_REGISTROS_DEPURACION = 10;

export async function depurarVersiones(
  params: ParametrosDepuracionVersiones,
  contextoAuditoria?: ContextoAuditoria
): Promise<ResultadoDepuracion> {
  const ahora = new Date();
  const fechaLimite = new Date(ahora.getTime() - LIMITE_DIAS_SEGURIDAD * 24 * 60 * 60 * 1000);
  const fechaLimiteIso = fechaLimite.toISOString().slice(0, 10);

  if (!params.fechaCorte) {
    throw Object.assign(new Error('La fecha de corte es obligatoria.'), { status: 400 });
  }

  // Comprobar estrictamente en formato YYYY-MM-DD
  if (params.fechaCorte > fechaLimiteIso) {
    throw Object.assign(
      new Error(
        `Por seguridad, el historial del último mes está protegido. La fecha debe ser igual o anterior a ${fechaLimiteIso}.`
      ),
      { status: 400 }
    );
  }

  const fechaCorteDate = new Date(`${params.fechaCorte}T23:59:59.999Z`);
  if (isNaN(fechaCorteDate.getTime())) {
    throw Object.assign(new Error('Formato de fecha de corte inválido.'), { status: 400 });
  }

  // Regla invariable: SIEMPRE se conserva la última versión archivada para permitir rollback
  const conservarUltimo = true;

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
          64
        )::bigint AS bytes
      FROM paginas_versiones pv
      INNER JOIN paginas p ON p.id = pv.pagina_id
      WHERE pv.estado = 'archivado'
        AND pv.id != COALESCE(p.version_publicada_id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (:ambito::text IS NULL OR p.ambito = :ambito)
        AND (:paginaId::uuid IS NULL OR p.id = :paginaId)
        AND pv.creado_en <= :fechaCorte
        AND pv.id NOT IN (SELECT id FROM ultima_archivada)
      ORDER BY pv.creado_en ASC
      LIMIT :limiteRegistros
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
        fechaCorte: fechaCorteDate.toISOString(),
        limiteRegistros: LIMITE_REGISTROS_DEPURACION,
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

    const idsParaEliminar = filas.map((f) => f.version_id);
    const bytesTotales = filas.reduce((acc, f) => acc + Number(f.bytes), 0);

    // 3. Ejecutar eliminación
    await sequelize.query(
      `DELETE FROM paginas_versiones WHERE id IN (:ids);`,
      {
        replacements: { ids: idsParaEliminar },
        type: QueryTypes.DELETE,
        transaction: tx,
      }
    );

    // 4. Registrar en la bitácora de auditoría
    if (contextoAuditoria) {
      await logAudit(
        {
          ...contextoAuditoria,
          entidadId: filas[0].pagina_id,
          entidadTipo: 'pagina',
          accion: 'eliminar',
          camposModificados: [
            {
              campo: 'depuracion_versiones_antiguas',
              antes: {
                totalVersiones: idsParaEliminar.length,
                paginasAfectadas: paginasUnicas.length,
                bytesLiberados: bytesTotales,
                fechaCorte: params.fechaCorte,
                ambito: params.ambito ?? 'todos',
                conservarUltimoRespaldo: conservarUltimo,
              },
              despues: null,
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
    };
  });
}
