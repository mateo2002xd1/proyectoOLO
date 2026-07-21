"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aprobarPagina = void 0;
const pagina_repository_1 = require("../../repositories/pagina.repository");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id) => (UUID_RE.test(id) ? id : null);
const aprobarPagina = async (slug, userId) => {
    const pagina = await pagina_repository_1.PaginaRepository.findBySlug(slug);
    if (!pagina)
        throw new Error('Página no encontrada');
    const versionEnRevision = await pagina_repository_1.PaginaRepository.findVersionPorEstado(pagina.id, 'en_revision');
    if (!versionEnRevision)
        throw new Error('No hay versión en revisión');
    await pagina_repository_1.PaginaRepository.actualizarVersion(versionEnRevision, {
        estado: 'publicado',
        publicadoPor: toUUID(userId),
        publicadoEn: new Date(),
    });
    await pagina_repository_1.PaginaRepository.actualizarPagina(pagina, { versionPublicadaId: versionEnRevision.id });
    return { pagina, version: versionEnRevision };
};
exports.aprobarPagina = aprobarPagina;
//# sourceMappingURL=aprobar-pagina.usecase.js.map