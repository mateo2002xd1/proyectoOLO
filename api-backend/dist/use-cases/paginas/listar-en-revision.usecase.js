"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarEnRevision = void 0;
const pagina_repository_1 = require("../../repositories/pagina.repository");
const listarEnRevision = async () => {
    const versiones = await pagina_repository_1.PaginaRepository.listarEnRevision();
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
exports.listarEnRevision = listarEnRevision;
//# sourceMappingURL=listar-en-revision.usecase.js.map