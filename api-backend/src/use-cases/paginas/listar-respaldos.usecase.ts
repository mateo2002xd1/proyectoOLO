import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import type { Ambito } from '../../shared/ambito';

export interface AutorRespaldoDTO {
  id: string;
  nombre: string;
  email: string;
}

export interface RegistroRespaldoDTO {
  id: string;
  paginaId: string;
  titulo: string;
  slug: string;
  ambito: Ambito;
  numeroVersion: number;
  versionAnteriorNumero: number | null;
  versionAnteriorId: string | null;
  editadoPor: AutorRespaldoDTO;
  publicadoPor: AutorRespaldoDTO;
  editadoEn: string;
  publicadoEn: string;
}

interface FilaConsulta {
  pagina_id: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  version_id: string;
  numero_version: number;
  editado_en: Date | string | null;
  publicado_en: Date | string | null;
  editor_id: string | null;
  editor_nombre: string | null;
  editor_email: string | null;
  publicador_id: string | null;
  publicador_nombre: string | null;
  publicador_email: string | null;
  version_anterior_numero: number | null;
  version_anterior_id: string | null;
}

/**
 * Lista las publicaciones actuales de páginas junto con su versión anterior archivada (si existe).
 * Permite listar todas las páginas de forma global o filtrar por ámbito ('sitio' | 'intranet').
 */
export async function listarRespaldos(ambito?: Ambito): Promise<RegistroRespaldoDTO[]> {
  const sql = `
    SELECT
      p.id AS pagina_id,
      p.slug,
      p.titulo,
      p.ambito,
      vp.id AS version_id,
      vp.numero_version AS numero_version,
      vp.creado_en AS editado_en,
      vp.publicado_en AS publicado_en,
      u_edit.id AS editor_id,
      COALESCE(u_edit.nombre || ' ' || COALESCE(u_edit.apellidos, ''), 'Sistema') AS editor_nombre,
      COALESCE(u_edit.email, 'admin@olo.gov.co') AS editor_email,
      u_pub.id AS publicador_id,
      COALESCE(u_pub.nombre || ' ' || COALESCE(u_pub.apellidos, ''), 'Administrador') AS publicador_nombre,
      COALESCE(u_pub.email, 'admin@olo.gov.co') AS publicador_email,
      va.numero_version AS version_anterior_numero,
      va.id AS version_anterior_id
    FROM paginas p
    INNER JOIN paginas_versiones vp ON vp.id = p.version_publicada_id
    LEFT JOIN usuarios u_edit ON u_edit.id = vp.creado_por
    LEFT JOIN usuarios u_pub ON u_pub.id = vp.publicado_por
    LEFT JOIN LATERAL (
      SELECT id, numero_version
      FROM paginas_versiones
      WHERE pagina_id = p.id
        AND estado = 'archivado'
        AND publicado_en IS NOT NULL
      ORDER BY publicado_en DESC
      LIMIT 1
    ) va ON true
    WHERE (:ambito::text IS NULL OR p.ambito = :ambito)
    ORDER BY vp.publicado_en DESC NULLS LAST;
  `;

  const filas = await sequelize.query<FilaConsulta>(sql, {
    replacements: { ambito: ambito || null },
    type: QueryTypes.SELECT,
  });

  return filas.map((fila) => ({
    id: fila.version_id,
    paginaId: fila.pagina_id,
    titulo: fila.titulo,
    slug: fila.slug,
    ambito: fila.ambito,
    numeroVersion: Number(fila.numero_version),
    versionAnteriorNumero: fila.version_anterior_numero ? Number(fila.version_anterior_numero) : null,
    versionAnteriorId: fila.version_anterior_id || null,
    editadoPor: {
      id: fila.editor_id || '',
      nombre: (fila.editor_nombre || 'Sistema').trim(),
      email: fila.editor_email || 'admin@olo.gov.co',
    },
    publicadoPor: {
      id: fila.publicador_id || '',
      nombre: (fila.publicador_nombre || 'Administrador').trim(),
      email: fila.publicador_email || 'admin@olo.gov.co',
    },
    editadoEn: fila.editado_en ? new Date(fila.editado_en).toISOString() : new Date().toISOString(),
    publicadoEn: fila.publicado_en ? new Date(fila.publicado_en).toISOString() : new Date().toISOString(),
  }));
}
