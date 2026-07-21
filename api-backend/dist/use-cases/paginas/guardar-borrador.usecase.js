"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardarBorrador = void 0;
const pagina_repository_1 = require("../../repositories/pagina.repository");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id) => (UUID_RE.test(id) ? id : null);
const guardarBorrador = async (slug, contenido, userId) => {
    let pagina = await pagina_repository_1.PaginaRepository.findBySlug(slug);
    if (!pagina) {
        pagina = await pagina_repository_1.PaginaRepository.crear({
            slug,
            titulo: slug,
            creadoPor: toUUID(userId),
        });
    }
    const ultimaVersion = await pagina_repository_1.PaginaRepository.findUltimaVersion(pagina.id);
    const numeroVersion = ultimaVersion ? ultimaVersion.numeroVersion + 1 : 1;
    const version = await pagina_repository_1.PaginaRepository.crearVersion({
        paginaId: pagina.id,
        contenido,
        numeroVersion,
        estado: 'borrador',
    });
    return { pagina, version };
};
exports.guardarBorrador = guardarBorrador;
//# sourceMappingURL=guardar-borrador.usecase.js.map