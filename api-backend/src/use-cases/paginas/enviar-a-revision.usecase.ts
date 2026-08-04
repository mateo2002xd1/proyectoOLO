import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';

export const enviarARevision = async (slug: string, ambito: Ambito) => {
  const pagina = await PaginaRepository.findBySlug(slug, ambito);
  if (!pagina) throw new Error('Página no encontrada');

  const ultimaVersion = await PaginaRepository.findVersionPorEstado(pagina.id, 'borrador');
  if (!ultimaVersion) throw new Error('No hay borrador para enviar a revisión');

  await PaginaRepository.actualizarVersion(ultimaVersion, { estado: 'en_revision' });

  return { pagina, version: ultimaVersion };
};
