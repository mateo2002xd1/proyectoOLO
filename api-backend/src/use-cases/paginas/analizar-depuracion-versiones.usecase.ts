import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import type { Ambito } from '../../shared/ambito';

export interface FiltrosAnalisisDepuracion {
  ambito?: Ambito;
  paginaId?: string;
  fechaCorte: string; // ISO YYYY-MM-DD
  conservarUltimoRespaldo?: boolean;
}

export interface DetallePaginaDepuracion {
  paginaId: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  cantidadVersiones: number;
  bytesEstimados: number;
}

export interface ResultadoAnalisisDepuracion {
  totalVersiones: number;
  totalPaginas: number;
  bytesEstimados: number;
  fechaCorteLimite: string;
  limiteMaximo?: number;
  paginasAfectadas: DetallePaginaDepuracion[];
}

const LIMITE_DIAS_SEGURIDAD = 30;

export async function analizarDepuracionVersiones(
  filtros: FiltrosAnalisisDepuracion
): Promise<ResultadoAnalisisDepuracion> {
  const ahora = new Date();
  const fechaLimite = new Date(ahora.getTime() - LIMITE_DIAS_SEGURIDAD * 24 * 60 * 60 * 1000);
  const fechaLimiteIso = fechaLimite.toISOString().slice(0, 10);

  if (!filtros.fechaCorte) {
    throw Object.assign(new Error('La fecha de corte es obligatoria.'), { status: 400 });
  }

  // Comprobar estrictamente en formato YYYY-MM-DD
  if (filtros.fechaCorte > fechaLimiteIso) {
    throw Object.assign(
      new Error(
        `Por seguridad, el historial del último mes está protegido. La fecha debe ser igual o anterior a ${fechaLimiteIso}.`
      ),
      { status: 400 }
    );
  }

  const fechaCorteDate = new Date(`${filtros.fechaCorte}T23:59:59.999Z`);
  if (isNaN(fechaCorteDate.getTime())) {
    throw Object.assign(new Error('Formato de fecha de corte inválido.'), { status: 400 });
  }

  // Regla invariable: SIEMPRE se conserva la última versión archivada para permitir rollback
  const conservarUltimo = true;

  // Consulta que obtiene el conteo global y el detalle de TODAS las versiones candidatas
  const sql = `
    WITH ultima_archivada AS (
      SELECT DISTINCT ON (pagina_id) id
      FROM paginas_versiones
      WHERE estado = 'archivado'
      ORDER BY pagina_id, publicado_en DESC NULLS LAST, numero_version DESC
    ),
    candidatas AS (
      SELECT
        pv.id AS version_id,
        pv.pagina_id,
        p.slug,
        p.titulo,
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
    )
    SELECT
      pagina_id,
      slug,
      titulo,
      ambito,
      COUNT(*)::int AS cantidad_versiones,
      SUM(bytes)::bigint AS bytes_estimados
    FROM candidatas
    GROUP BY pagina_id, slug, titulo, ambito
    ORDER BY bytes_estimados DESC;
  `;

  const filas = await sequelize.query<{
    pagina_id: string;
    slug: string;
    titulo: string;
    ambito: Ambito;
    cantidad_versiones: number;
    bytes_estimados: string | number;
  }>(sql, {
    replacements: {
      ambito: filtros.ambito || null,
      paginaId: filtros.paginaId || null,
      fechaCorte: fechaCorteDate.toISOString(),
    },
    type: QueryTypes.SELECT,
  });

  const paginasAfectadas: DetallePaginaDepuracion[] = filas.map((f) => ({
    paginaId: f.pagina_id,
    slug: f.slug,
    titulo: f.titulo,
    ambito: f.ambito,
    cantidadVersiones: Number(f.cantidad_versiones),
    bytesEstimados: Number(f.bytes_estimados),
  }));

  const totalVersiones = paginasAfectadas.reduce((acc, p) => acc + p.cantidadVersiones, 0);
  const totalPaginas = paginasAfectadas.length;
  const bytesEstimados = paginasAfectadas.reduce((acc, p) => acc + p.bytesEstimados, 0);

  return {
    totalVersiones,
    totalPaginas,
    bytesEstimados,
    fechaCorteLimite: fechaLimiteIso,
    paginasAfectadas,
  };
}
