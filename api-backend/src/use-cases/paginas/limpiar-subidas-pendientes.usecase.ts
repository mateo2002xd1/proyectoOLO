import fs from 'fs/promises';
import path from 'path';
import { Op } from 'sequelize';
import sequelize from '../../config/database';
import { Pagina, PaginaVersion, SubidaPendiente } from '../../infrastructure/db/models';
import { BloqueoEdicionRepository } from '../../repositories/bloqueo-edicion.repository';
import { resolverDirectorioUploads } from '../../shared/storage/backup-uploads.service';
import type { Ambito } from '../../shared/ambito';

/**
 * Al publicar, guardar borrador o cerrar, borra de `uploads/` los archivos que se subieron
 * y que ninguna versión (de ninguna página del ámbito) usa. Devuelve las rutas borradas.
 */
export const limpiarSubidasPendientes = async (params: {
  paginaId: string;
  slug: string;
  ambito: Ambito;
  usuarioId: string;
}): Promise<string[]> => {
  const { paginaId, slug, ambito, usuarioId } = params;

  // Quien tiene el editor abierto puede tener subidas que aún no guardó en el borrador.
  const bloqueo = await BloqueoEdicionRepository.vigente(ambito, slug);
  if (bloqueo && bloqueo.usuario_id !== usuarioId) return [];

  const pendientes = await SubidaPendiente.findAll({ where: { paginaId } });
  if (pendientes.length === 0) return [];

  const referenciadas = new Set<string>();

  // Optimización: delegar a la BD la búsqueda de rutas dentro de las versiones,
  // evitando cargar y parsear el JSON de todas las páginas en memoria de Node.
  for (const { ruta } of pendientes) {
    const enUso = await PaginaVersion.findOne({
      where: {
        [Op.or]: [
          sequelize.where(sequelize.cast(sequelize.col('PaginaVersion.contenido'), 'text'), { [Op.like]: `%${ruta}%` }),
          sequelize.where(sequelize.cast(sequelize.col('PaginaVersion.layout'), 'text'), { [Op.like]: `%${ruta}%` }),
        ]
      },
      include: [
        {
          model: Pagina,
          as: 'pagina',
          where: { ambito },
          attributes: [],
        },
      ],
      attributes: ['id'],
    });

    if (enUso) {
      referenciadas.add(ruta);
    }
  }

  const dirUploads = resolverDirectorioUploads(ambito);
  const borradas: string[] = [];

  for (const { ruta } of pendientes) {
    if (referenciadas.has(ruta)) continue;
    try {
      await fs.rm(path.join(dirUploads, ruta.replace(/^\/uploads\//, '')), { force: true });
      borradas.push(ruta);
    } catch (e) {
      // Si falla la eliminación física, ignoramos (evita romper el proceso)
    }
  }

  if (borradas.length > 0) {
    // Solo eliminamos del registro de pendientes las que efectivamente borramos.
    // Las que están en uso (referenciadas) se mantienen en pendientes hasta que
    // se publique la página o se reemplace el archivo y quede huérfano.
    await SubidaPendiente.destroy({
      where: { paginaId, ruta: { [Op.in]: borradas } },
    });
  }

  return borradas;
};
