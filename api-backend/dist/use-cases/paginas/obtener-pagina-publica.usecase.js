"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerPaginaPublica = void 0;
const pagina_repository_1 = require("../../repositories/pagina.repository");
const obtenerPaginaPublica = async (slug) => {
    const pagina = await pagina_repository_1.PaginaRepository.findBySlug(slug);
    if (!pagina)
        return null;
    if (!pagina.versionPublicadaId)
        return null;
    const version = await pagina_repository_1.PaginaRepository.findVersionPorId(pagina.versionPublicadaId);
    if (!version)
        return null;
    let contenido = version.contenido;
    if (Array.isArray(contenido)) {
        contenido = { content: contenido, root: { props: {} } };
    }
    else if (!contenido || !contenido.content) {
        contenido = { content: [], root: { props: {} } };
    }
    return {
        id: pagina.id,
        slug: pagina.slug,
        titulo: pagina.titulo,
        contenido,
        layout: version.layout,
        publicadoEn: version.publicadoEn,
    };
};
exports.obtenerPaginaPublica = obtenerPaginaPublica;
//# sourceMappingURL=obtener-pagina-publica.usecase.js.map