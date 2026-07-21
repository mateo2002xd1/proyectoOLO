"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginaRepository = void 0;
const models_1 = require("../infrastructure/db/models");
exports.PaginaRepository = {
    findBySlug: (slug) => models_1.Pagina.findOne({ where: { slug } }),
    crear: (data) => models_1.Pagina.create(data),
    actualizarPagina: (pagina, data) => pagina.update(data),
    findUltimaVersion: (paginaId) => models_1.PaginaVersion.findOne({
        where: { paginaId },
        order: [['numeroVersion', 'DESC']],
    }),
    findVersionPorEstado: (paginaId, estado) => models_1.PaginaVersion.findOne({
        where: { paginaId, estado },
        order: [['numeroVersion', 'DESC']],
    }),
    crearVersion: (data) => models_1.PaginaVersion.create(data),
    actualizarVersion: (version, data) => version.update(data),
    findVersionPorId: (id) => models_1.PaginaVersion.findByPk(id),
    listarEnRevision: () => models_1.PaginaVersion.findAll({
        where: { estado: 'en_revision' },
        include: [
            { model: models_1.Pagina, as: 'pagina' },
            { model: models_1.User, as: 'publicador', attributes: ['id', 'nombre', 'email'] },
        ],
        order: [['creadoEn', 'DESC']],
    }),
};
//# sourceMappingURL=pagina.repository.js.map