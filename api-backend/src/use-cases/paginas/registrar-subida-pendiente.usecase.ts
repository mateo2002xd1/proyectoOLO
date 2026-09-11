import { PaginaRepository } from '../../repositories/pagina.repository';
import { SubidaPendiente } from '../../infrastructure/db/models';
import type { Ambito } from '../../shared/ambito';

/** Anota que `ruta` se subió desde el editor de esta página y aún no se ha publicado. */
export const registrarSubidaPendiente = async (slug: string, ruta: string, ambito: Ambito) => {
  const pagina = await PaginaRepository.findBySlug(slug, ambito);
  if (!pagina) throw new Error('Página no encontrada');

  await SubidaPendiente.findOrCreate({ where: { paginaId: pagina.id, ruta } });
};
