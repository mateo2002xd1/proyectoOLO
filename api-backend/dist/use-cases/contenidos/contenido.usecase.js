"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarContenido = exports.buscarContenidoGlobal = exports.actualizarContenido = exports.crearContenido = exports.obtenerContenidoPorId = exports.obtenerContenidos = void 0;
const crypto_1 = require("crypto");
const contenido_repository_1 = require("../../repositories/contenido.repository");
const secciones_repository_1 = require("../../repositories/secciones.repository");
const auditoria_repository_1 = require("../../repositories/auditoria.repository");
const obtenerContenidos = (filters = {}) => contenido_repository_1.ContenidoRepository.findAll(filters);
exports.obtenerContenidos = obtenerContenidos;
const obtenerContenidoPorId = async (id) => {
    const contenido = await contenido_repository_1.ContenidoRepository.findById(id);
    if (!contenido)
        throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
    return contenido;
};
exports.obtenerContenidoPorId = obtenerContenidoPorId;
const crearContenido = async (data, authorId) => {
    const existing = await contenido_repository_1.ContenidoRepository.findBySlug(data.slug);
    if (existing)
        throw Object.assign(new Error('Ya existe un contenido con ese slug'), { status: 409 });
    const section = await secciones_repository_1.SectionRepository.findById(data.sectionId);
    if (!section)
        throw Object.assign(new Error('Sección no encontrada'), { status: 404 });
    const id = (0, crypto_1.randomUUID)();
    const contenido = await contenido_repository_1.ContenidoRepository.create({ id, ...data, authorId });
    await auditoria_repository_1.AuditRepository.create({
        content_id: id,
        content_type: 'contenido',
        user_id: authorId || null,
        action_type: 'create',
        modified_fields: Object.keys(data).map((k) => ({ field: k, old: null, new: data[k] })),
    });
    return contenido;
};
exports.crearContenido = crearContenido;
const actualizarContenido = async (id, data) => {
    const contenido = await contenido_repository_1.ContenidoRepository.findById(id);
    if (!contenido)
        throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
    if (data.slug && data.slug !== contenido.slug) {
        const duplicate = await contenido_repository_1.ContenidoRepository.findBySlug(data.slug);
        if (duplicate)
            throw Object.assign(new Error('Ya existe un contenido con ese slug'), { status: 409 });
    }
    const [, updated] = await contenido_repository_1.ContenidoRepository.update(id, data);
    return updated?.[0] || contenido;
};
exports.actualizarContenido = actualizarContenido;
const buscarContenidoGlobal = async (term) => {
    if (!term || term.trim().length === 0)
        return { contenidos: [] };
    return { contenidos: await contenido_repository_1.ContenidoRepository.globalLookup(term.trim()) };
};
exports.buscarContenidoGlobal = buscarContenidoGlobal;
const eliminarContenido = async (id) => {
    const contenido = await contenido_repository_1.ContenidoRepository.findById(id);
    if (!contenido)
        throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
    await contenido_repository_1.ContenidoRepository.delete(id);
    return { message: 'Contenido eliminado' };
};
exports.eliminarContenido = eliminarContenido;
//# sourceMappingURL=contenido.usecase.js.map