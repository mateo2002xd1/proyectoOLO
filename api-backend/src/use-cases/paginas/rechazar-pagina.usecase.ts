import { PaginaRepository } from '../../repositories/pagina.repository';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id: string) => (UUID_RE.test(id) ? id : null);

export const rechazarPagina = async (slug: string, userId: string, motivo: string) => {
  const pagina = await PaginaRepository.findBySlug(slug);
  if (!pagina) throw new Error('Página no encontrada');

  const versionEnRevision = await PaginaRepository.findVersionPorEstado(pagina.id, 'en_revision');
  if (!versionEnRevision) throw new Error('No hay versión en revisión');

  await PaginaRepository.actualizarVersion(versionEnRevision, {
    estado: 'rechazado',
    motivoRechazo: motivo,
    revisorId: toUUID(userId),
  });

  return { pagina, version: versionEnRevision };
};
