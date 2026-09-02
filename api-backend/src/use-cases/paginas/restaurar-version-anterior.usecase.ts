import { Op } from 'sequelize';
import sequelize from '../../config/database';
import { Pagina, PaginaVersion } from '../../infrastructure/db/models';
import { PaginaRepository } from '../../repositories/pagina.repository';
import { emitirContenidoPublicado } from '../../domain-events/paginas/contenido-publicado.event';
import type { Ambito } from '../../shared/ambito';
import { restaurarArchivosDesdeBackup } from '../../shared/storage/backup-uploads.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id?: string) => (id && UUID_RE.test(id) ? id : null);

export async function restaurarVersionAnterior(
  slugOId: string,
  userId?: string,
  ambito: Ambito = 'intranet'
) {
  const esUUID = UUID_RE.test(slugOId);
  const pagina = esUUID
    ? await Pagina.findByPk(slugOId)
    : await PaginaRepository.findBySlug(slugOId, ambito);

  if (!pagina) {
    throw new Error(`Página con identificador "${slugOId}" no encontrada en el ámbito "${ambito}"`);
  }

  // 1. Obtener la versión actualmente publicada
  const versionPublicada = await PaginaVersion.findOne({
    where: { paginaId: pagina.id, estado: 'publicado' },
  });

  // 2. Obtener la última versión que estuvo publicada y ahora está archivada
  const versionArchivada = await PaginaVersion.findOne({
    where: {
      paginaId: pagina.id,
      estado: 'archivado',
      publicadoEn: { [Op.ne]: null },
    },
    order: [['publicadoEn', 'DESC']],
  });

  if (!versionArchivada) {
    throw new Error(`La página "${pagina.slug}" no tiene ninguna versión anterior archivada para restaurar.`);
  }

  // 3. Sincronizar archivos de disco entre backup y uploads
  const resultadoArchivos = restaurarArchivosDesdeBackup({
    paginaId: pagina.id,
    versionRestaurarContenido: versionArchivada.contenido,
    versionActualContenido: versionPublicada ? versionPublicada.contenido : null,
    ambito,
  });

  // 4. Ejecutar el intercambio atómico en PostgreSQL
  await sequelize.transaction(async (t) => {
    // Si hay una versión actualmente publicada, pasa a archivado
    if (versionPublicada) {
      await versionPublicada.update({ estado: 'archivado' }, { transaction: t });
    }

    // La versión archivada pasa a ser la publicada
    await versionArchivada.update(
      {
        estado: 'publicado',
        publicadoEn: new Date(),
        publicadoPor: toUUID(userId),
      },
      { transaction: t }
    );

    // Actualizar la referencia en la página
    await pagina.update(
      { versionPublicadaId: versionArchivada.id },
      { transaction: t }
    );
  });

  // 5. Invalidar caché en caliente (Redis + Next.js ISR)
  await emitirContenidoPublicado({
    paginaId: pagina.id,
    slug: pagina.slug,
    ambito,
    versionId: versionArchivada.id,
    publicadoPor: toUUID(userId),
    fecha: new Date(),
  });

  return {
    pagina,
    versionRestaurada: {
      id: versionArchivada.id,
      numeroVersion: versionArchivada.numeroVersion,
      estado: 'publicado',
    },
    versionAnteriorArchivada: versionPublicada
      ? {
          id: versionPublicada.id,
          numeroVersion: versionPublicada.numeroVersion,
          estado: 'archivado',
        }
      : null,
    archivos: resultadoArchivos,
  };
}
