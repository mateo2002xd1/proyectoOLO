import { Transaction } from 'sequelize';
import { Pagina, PaginaVersion, User } from '../infrastructure/db/models';
import type { Ambito } from '../shared/ambito';

export const PaginaRepository = {
  // El slug solo identifica una página dentro de su ámbito: el sitio y la intranet
  // tienen cada uno su `/inicio`. Buscar por slug a secas devolvía la página de la
  // otra aplicación.
  findBySlug: (slug: string, ambito: Ambito, tx?: Transaction) => Pagina.findOne({ where: { slug, ambito }, transaction: tx }),

  crear: (data: any, tx?: Transaction) => Pagina.create(data, { transaction: tx }),

  actualizarPagina: (pagina: Pagina, data: any, tx?: Transaction) => pagina.update(data, { transaction: tx }),

  findUltimaVersion: (paginaId: string, tx?: Transaction) =>
    PaginaVersion.findOne({
      where: { paginaId },
      order: [['numeroVersion', 'DESC']],
      transaction: tx,
    }),

  findVersionPorEstado: (paginaId: string, estado: string, tx?: Transaction) =>
    PaginaVersion.findOne({
      where: { paginaId, estado },
      order: [['numeroVersion', 'DESC']],
      transaction: tx,
    }),

  crearVersion: (data: any, tx?: Transaction) => PaginaVersion.create(data, { transaction: tx }),

  /**
   * Archiva la versión publicada vigente de una página. Debe llamarse antes de
   * publicar la siguiente: el índice `uq_pagina_version_publicada` solo admite una
   * versión en estado 'publicado' por página.
   */
  archivarVersionPublicada: (paginaId: string, tx?: Transaction) =>
    PaginaVersion.update({ estado: 'archivado' }, { where: { paginaId, estado: 'publicado' }, transaction: tx }),

  actualizarVersion: (version: PaginaVersion, data: any, tx?: Transaction) => version.update(data, { transaction: tx }),

  eliminarVersion: (version: PaginaVersion, tx?: Transaction) => version.destroy({ transaction: tx }),

  contarVersiones: (paginaId: string, tx?: Transaction) => PaginaVersion.count({ where: { paginaId }, transaction: tx }),

  eliminarPagina: (pagina: Pagina, tx?: Transaction) => pagina.destroy({ transaction: tx }),

  findVersionPorId: (id: string, tx?: Transaction) => PaginaVersion.findByPk(id, { transaction: tx }),

  // La cola de revisión es única para las dos aplicaciones: quien aprueba lo hace
  // desde el panel del sitio y ahí debe ver también lo que llega de la intranet.
  // Cada versión viaja con el ámbito de su página para saber sobre cuál se actúa.
  listarEnRevision: (tx?: Transaction) =>
    PaginaVersion.findAll({
      where: { estado: 'en_revision' },
      include: [
        { model: Pagina, as: 'pagina', required: true },
        { model: User, as: 'publicador', attributes: ['id', 'nombre', 'email'] },
      ],
      order: [['creadoEn', 'DESC']],
      transaction: tx,
    }),
};
