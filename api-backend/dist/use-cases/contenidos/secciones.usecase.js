"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSection = exports.updateSection = exports.createSection = exports.getSectionById = exports.getAllSections = void 0;
const crypto_1 = require("crypto");
const secciones_repository_1 = require("../../repositories/secciones.repository");
const getAllSections = () => secciones_repository_1.SectionRepository.findAll();
exports.getAllSections = getAllSections;
const getSectionById = async (id) => {
    const section = await secciones_repository_1.SectionRepository.findById(id);
    if (!section)
        throw Object.assign(new Error('Sección no encontrada'), { status: 404 });
    return section;
};
exports.getSectionById = getSectionById;
const createSection = async (data) => {
    const existing = await secciones_repository_1.SectionRepository.findBySlug(data.slug);
    if (existing)
        throw Object.assign(new Error('Ya existe una sección con ese slug'), { status: 409 });
    return secciones_repository_1.SectionRepository.create({ id: (0, crypto_1.randomUUID)(), ...data });
};
exports.createSection = createSection;
const updateSection = async (id, data) => {
    const section = await secciones_repository_1.SectionRepository.findById(id);
    if (!section)
        throw Object.assign(new Error('Sección no encontrada'), { status: 404 });
    const [, updated] = await secciones_repository_1.SectionRepository.update(id, data);
    return updated?.[0] || section;
};
exports.updateSection = updateSection;
const deleteSection = async (id) => {
    const section = await secciones_repository_1.SectionRepository.findById(id);
    if (!section)
        throw Object.assign(new Error('Sección no encontrada'), { status: 404 });
    await secciones_repository_1.SectionRepository.delete(id);
    return { message: 'Sección eliminada' };
};
exports.deleteSection = deleteSection;
//# sourceMappingURL=secciones.usecase.js.map