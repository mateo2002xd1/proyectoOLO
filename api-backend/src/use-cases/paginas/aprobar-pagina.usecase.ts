import { Pagina, PaginaVersion } from '../../infrastructure/db/models';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id: string) => (UUID_RE.test(id) ? id : null);

export const aprobarPagina = async (slug: string, userId: string) => {
  const pagina = await Pagina.findOne({ where: { slug } });
  if (!pagina) throw new Error('Página no encontrada');

  const versionEnRevision = await PaginaVersion.findOne({
    where: { paginaId: pagina.id, estado: 'en_revision' },
    order: [['numeroVersion', 'DESC']],
  });

  if (!versionEnRevision) throw new Error('No hay versión en revisión');

  await versionEnRevision.update({
    estado: 'publicado',
    publicadoPor: toUUID(userId),
    publicadoEn: new Date(),
  });

  await pagina.update({ versionPublicadaId: versionEnRevision.id });

  return { pagina, version: versionEnRevision };
};
