"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarARevision = void 0;
const pagina_repository_1 = require("../../repositories/pagina.repository");
const enviarARevision = async (slug) => {
    const pagina = await pagina_repository_1.PaginaRepository.findBySlug(slug);
    if (!pagina)
        throw new Error('Página no encontrada');
    const ultimaVersion = await pagina_repository_1.PaginaRepository.findVersionPorEstado(pagina.id, 'borrador');
    if (!ultimaVersion)
        throw new Error('No hay borrador para enviar a revisión');
    await pagina_repository_1.PaginaRepository.actualizarVersion(ultimaVersion, { estado: 'en_revision' });
    return { pagina, version: ultimaVersion };
};
exports.enviarARevision = enviarARevision;
//# sourceMappingURL=enviar-a-revision.usecase.js.map