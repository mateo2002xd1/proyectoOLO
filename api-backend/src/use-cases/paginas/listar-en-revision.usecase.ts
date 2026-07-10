import { Pagina, PaginaVersion, User } from '../../infrastructure/db/models';

export const listarEnRevision = async () => {
  const versiones = await PaginaVersion.findAll({
    where: { estado: 'en_revision' },
    include: [
      { model: Pagina, as: 'pagina' },
      { model: User, as: 'publicador', attributes: ['id', 'nombre', 'email'] },
    ],
    order: [['creadoEn', 'DESC']],
  });

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
