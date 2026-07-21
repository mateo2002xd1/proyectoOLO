import { Pagina, PaginaVersion, User } from '../infrastructure/db/models';

export const PaginaRepository = {
  findBySlug: (slug: string) => Pagina.findOne({ where: { slug } }),

  crear: (data: any) => Pagina.create(data),

  actualizarPagina: (pagina: Pagina, data: any) => pagina.update(data),

  findUltimaVersion: (paginaId: string) =>
    PaginaVersion.findOne({
      where: { paginaId },
      order: [['numeroVersion', 'DESC']],
    }),

  findVersionPorEstado: (paginaId: string, estado: string) =>
    PaginaVersion.findOne({
      where: { paginaId, estado },
      order: [['numeroVersion', 'DESC']],
    }),

  crearVersion: (data: any) => PaginaVersion.create(data),

  actualizarVersion: (version: PaginaVersion, data: any) => version.update(data),

  findVersionPorId: (id: string) => PaginaVersion.findByPk(id),

  listarEnRevision: () =>
    PaginaVersion.findAll({
      where: { estado: 'en_revision' },
      include: [
        { model: Pagina, as: 'pagina' },
        { model: User, as: 'publicador', attributes: ['id', 'nombre', 'email'] },
      ],
      order: [['creadoEn', 'DESC']],
    }),
};
