import { Pagina, PaginaVersion } from '../../infrastructure/db/models';

export const enviarARevision = async (slug: string) => {
  const pagina = await Pagina.findOne({ where: { slug } });
  if (!pagina) throw new Error('Página no encontrada');

  const ultimaVersion = await PaginaVersion.findOne({
    where: { paginaId: pagina.id, estado: 'borrador' },
    order: [['numeroVersion', 'DESC']],
  });

  if (!ultimaVersion) throw new Error('No hay borrador para enviar a revisión');

  await ultimaVersion.update({ estado: 'en_revision' });

  return { pagina, version: ultimaVersion };
};
