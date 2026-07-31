import { Pagina, PaginaVersion, User } from '../infrastructure/db/models';
import type { Ambito } from '../shared/ambito';

export const PaginaRepository = {
  // El slug solo identifica una página dentro de su ámbito: el sitio y la intranet
  // tienen cada uno su `/inicio`. Buscar por slug a secas devolvía la página de la
  // otra aplicación.
  findBySlug: (slug: string, ambito: Ambito) => Pagina.findOne({ where: { slug, ambito } }),

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

  eliminarVersion: (version: PaginaVersion) => version.destroy(),

  contarVersiones: (paginaId: string) => PaginaVersion.count({ where: { paginaId } }),

  eliminarPagina: (pagina: Pagina) => pagina.destroy(),

  findVersionPorId: (id: string) => PaginaVersion.findByPk(id),

  // La cola de revisión es única para las dos aplicaciones: quien aprueba lo hace
  // desde el panel del sitio y ahí debe ver también lo que llega de la intranet.
  // Cada versión viaja con el ámbito de su página para saber sobre cuál se actúa.
  listarEnRevision: () =>
    PaginaVersion.findAll({
      where: { estado: 'en_revision' },
      include: [
        { model: Pagina, as: 'pagina', required: true },
        { model: User, as: 'publicador', attributes: ['id', 'nombre', 'email'] },
      ],
      order: [['creadoEn', 'DESC']],
    }),
};
