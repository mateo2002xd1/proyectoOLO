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

  /**
   * Archiva la versión publicada vigente de una página. Debe llamarse antes de
   * publicar la siguiente: el índice `uq_pagina_version_publicada` solo admite una
   * versión en estado 'publicado' por página.
   */
  archivarVersionPublicada: (paginaId: string) =>
    PaginaVersion.update({ estado: 'archivado' }, { where: { paginaId, estado: 'publicado' } }),

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
