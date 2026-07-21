import { PaginaRepository } from '../../repositories/pagina.repository';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id: string) => (UUID_RE.test(id) ? id : null);

export const guardarBorrador = async (slug: string, contenido: any, userId: string) => {
  let pagina = await PaginaRepository.findBySlug(slug);

  if (!pagina) {
    pagina = await PaginaRepository.crear({
      slug,
      titulo: slug,
      creadoPor: toUUID(userId),
    });
  }

  const ultimaVersion = await PaginaRepository.findUltimaVersion(pagina.id);
  const numeroVersion = ultimaVersion ? ultimaVersion.numeroVersion + 1 : 1;

  const version = await PaginaRepository.crearVersion({
    paginaId: pagina.id,
    contenido,
    numeroVersion,
    estado: 'borrador',
  });

  return { pagina, version };
};
