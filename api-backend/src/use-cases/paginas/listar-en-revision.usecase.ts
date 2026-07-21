import { PaginaRepository } from '../../repositories/pagina.repository';

export const listarEnRevision = async () => {
  const versiones = await PaginaRepository.listarEnRevision();

  return versiones.map((v) => ({
    id: v.id,
    paginaId: v.paginaId,
    titulo: v.pagina?.titulo,
    slug: v.pagina?.slug,
    numeroVersion: v.numeroVersion,
    creadoEn: v.creadoEn,
    autor: v.publicador,
  }));
};
