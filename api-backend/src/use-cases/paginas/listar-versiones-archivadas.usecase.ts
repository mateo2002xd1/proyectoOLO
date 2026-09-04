import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import type { Ambito } from '../../shared/ambito';
import {
  extraerRutasUploads,
  listarArchivosEnBackup,
} from '../../shared/storage/backup-uploads.service';

export interface VersionArchivadaResumen {
  paginaId: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  versionPublicadaActualId: string | null;
  versionArchivadaId: string;
  versionArchivadaNumero: number;
  versionArchivadaPublicadoEn: string | null;
  archivosQueUsa: string[];
  archivosEnBackup: string[];
}

interface FilaConsulta {
  pagina_id: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  version_publicada_id: string | null;
  version_archivada_id: string;
  version_archivada_numero: number;
  version_archivada_publicado_en: string | null;
  version_archivada_contenido: unknown;
}

/**
 * Lista las páginas del ámbito indicado que tienen al menos una versión anterior archivada,
 * seleccionando para cada una su versión archivada más reciente.
 */
export async function listarVersionesArchivadas(
  ambito: Ambito = 'intranet'
): Promise<VersionArchivadaResumen[]> {
  const sql = `
    SELECT DISTINCT ON (p.id)
      p.id AS pagina_id,
      p.slug,
      p.titulo,
      p.ambito,
      p.version_publicada_id,
      pv.id AS version_archivada_id,
      pv.numero_version AS version_archivada_numero,
      pv.publicado_en AS version_archivada_publicado_en,
      pv.contenido AS version_archivada_contenido
    FROM paginas p
    INNER JOIN paginas_versiones pv ON pv.pagina_id = p.id
    WHERE p.ambito = :ambito
      AND pv.estado = 'archivado'
      AND pv.publicado_en IS NOT NULL
    ORDER BY p.id, pv.publicado_en DESC;
  `;

  const filas = await sequelize.query<FilaConsulta>(sql, {
    replacements: { ambito },
    type: QueryTypes.SELECT,
  });

  return filas.map((fila) => {
    const archivosQueUsa = extraerRutasUploads(fila.version_archivada_contenido);
    const archivosEnBackup = listarArchivosEnBackup(fila.pagina_id, fila.ambito);

    return {
      paginaId: fila.pagina_id,
      slug: fila.slug,
      titulo: fila.titulo,
      ambito: fila.ambito,
      versionPublicadaActualId: fila.version_publicada_id,
      versionArchivadaId: fila.version_archivada_id,
      versionArchivadaNumero: fila.version_archivada_numero,
      versionArchivadaPublicadoEn: fila.version_archivada_publicado_en,
      archivosQueUsa,
      archivosEnBackup,
    };
  });
}
