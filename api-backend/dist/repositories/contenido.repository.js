"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContenidoRepository = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../infrastructure/db/models");
exports.ContenidoRepository = {
    findAll: (where = {}) => models_1.Contenido.findAll({
        where,
        include: [{ model: models_1.Section, as: 'section' }],
        order: [['createdAt', 'DESC']],
    }),
    findById: (id) => models_1.Contenido.findByPk(id, {
        include: [
            { model: models_1.Section, as: 'section' },
            { model: models_1.Attachment, as: 'attachments' },
        ],
    }),
    findBySlug: (slug) => models_1.Contenido.findOne({
        where: { slug },
        include: [{ model: models_1.Section, as: 'section' }],
    }),
    globalLookup: (term) => {
        const normalized = `%${term}%`;
        return models_1.Contenido.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { title: { [sequelize_1.Op.iLike]: normalized } },
                    { content: { [sequelize_1.Op.iLike]: normalized } },
                    { excerpt: { [sequelize_1.Op.iLike]: normalized } },
                ],
            },
            include: [
                { model: models_1.Section, as: 'section', attributes: ['id', 'name', 'slug'] },
                { model: models_1.User, as: 'author', attributes: ['id', 'name', 'email'] },
            ],
            limit: 20,
            order: [['createdAt', 'DESC']],
        });
    },
    create: (data) => models_1.Contenido.create(data),
    update: (id, data) => models_1.Contenido.update(data, { where: { id }, returning: true }),
    delete: (id) => models_1.Contenido.destroy({ where: { id } }),
};
//# sourceMappingURL=contenido.repository.js.map