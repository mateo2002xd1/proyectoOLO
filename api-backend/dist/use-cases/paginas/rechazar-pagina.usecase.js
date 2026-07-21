"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rechazarPagina = void 0;
const pagina_repository_1 = require("../../repositories/pagina.repository");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id) => (UUID_RE.test(id) ? id : null);
const rechazarPagina = async (slug, userId, motivo) => {
    const pagina = await pagina_repository_1.PaginaRepository.findBySlug(slug);
    if (!pagina)
        throw new Error('Página no encontrada');
    const versionEnRevision = await pagina_repository_1.PaginaRepository.findVersionPorEstado(pagina.id, 'en_revision');
    if (!versionEnRevision)
        throw new Error('No hay versión en revisión');
    await pagina_repository_1.PaginaRepository.actualizarVersion(versionEnRevision, {
        estado: 'rechazado',
        motivoRechazo: motivo,
        revisorId: toUUID(userId),
    });
    return { pagina, version: versionEnRevision };
};
exports.rechazarPagina = rechazarPagina;
//# sourceMappingURL=rechazar-pagina.usecase.js.map