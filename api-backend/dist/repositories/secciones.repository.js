"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionRepository = void 0;
const models_1 = require("../infrastructure/db/models");
exports.SectionRepository = {
    findAll: () => models_1.Section.findAll(),
    findById: (id) => models_1.Section.findByPk(id),
    findBySlug: (slug) => models_1.Section.findOne({ where: { slug } }),
    create: (data) => models_1.Section.create(data),
    update: (id, data) => models_1.Section.update(data, { where: { id }, returning: true }),
    delete: (id) => models_1.Section.destroy({ where: { id } }),
};
//# sourceMappingURL=secciones.repository.js.map