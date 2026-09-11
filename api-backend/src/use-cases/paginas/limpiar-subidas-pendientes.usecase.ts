import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { Pagina, PaginaVersion, SubidaPendiente } from '../../infrastructure/db/models';
import { BloqueoEdicionRepository } from '../../repositories/bloqueo-edicion.repository';
import {
  extraerRutasUploads,
  resolverDirectorioUploads,
} from '../../shared/storage/backup-uploads.service';
import type { Ambito } from '../../shared/ambito';

/**
 * Al publicar una página, borra de `uploads/` los archivos que se subieron para ella y
 * que ninguna versión (de ninguna página del ámbito) usa: los que se reemplazaron antes
 * de publicar. Devuelve las rutas borradas.
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

  const paginas = await Pagina.findAll({ where: { ambito }, attributes: ['id'] });
  const versiones = await PaginaVersion.findAll({
    where: { paginaId: paginas.map((p) => p.id) },
    attributes: ['contenido', 'layout'],
  });

  const referenciadas = new Set<string>();
  for (const version of versiones) {
    for (const ruta of extraerRutasUploads(version.contenido)) referenciadas.add(ruta);
    for (const ruta of extraerRutasUploads(version.layout)) referenciadas.add(ruta);
  }

  const dirUploads = resolverDirectorioUploads(ambito);
  const borradas: string[] = [];
  for (const { ruta } of pendientes) {
    if (referenciadas.has(ruta)) continue;
    fs.rmSync(path.join(dirUploads, ruta.replace(/^\/uploads\//, '')), { force: true });
    borradas.push(ruta);
  }

  // Solo las filas leídas arriba: una subida anotada mientras tanto sigue pendiente.
  await SubidaPendiente.destroy({
    where: { paginaId, ruta: { [Op.in]: pendientes.map((p) => p.ruta) } },
  });

  return borradas;
};
