import { Pagina, PaginaVersion } from '../../infrastructure/db/models';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id: string) => (UUID_RE.test(id) ? id : null);

export const guardarBorrador = async (slug: string, contenido: any, userId: string) => {
  let pagina = await Pagina.findOne({ where: { slug } });

  if (!pagina) {
    pagina = await Pagina.create({
      slug,
      titulo: slug,
      creadoPor: toUUID(userId),
    });
  }

  const ultimaVersion = await PaginaVersion.findOne({
    where: { paginaId: pagina.id },
    order: [['numeroVersion', 'DESC']],
  });

  const numeroVersion = ultimaVersion ? ultimaVersion.numeroVersion + 1 : 1;

  const version = await PaginaVersion.create({
    paginaId: pagina.id,
    contenido,
    numeroVersion,
    estado: 'borrador',
  });

  return { pagina, version };
};
