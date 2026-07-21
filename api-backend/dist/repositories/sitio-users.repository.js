"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitioUserRepository = void 0;
const models_1 = require("../infrastructure/db/models");
exports.SitioUserRepository = {
    findAll: () => models_1.SitioUser.findAll({
        attributes: { exclude: ['password_hash'] },
        order: [['created_at', 'DESC']],
    }),
    findById: (id) => models_1.SitioUser.findByPk(id, {
        attributes: { exclude: ['password_hash'] },
    }),
    findByIdWithPassword: (id) => models_1.SitioUser.findByPk(id),
    findByEmail: (email) => models_1.SitioUser.findOne({
        where: { email: email.trim().toLowerCase() },
    }),
    create: (data) => models_1.SitioUser.create(data),
    update: (id, data) => models_1.SitioUser.update(data, { where: { id }, returning: true }),
    delete: (id) => models_1.SitioUser.destroy({ where: { id } }),
    updateLastLogin: (id) => models_1.SitioUser.update({ last_login_at: new Date() }, { where: { id } }),
};
//# sourceMappingURL=sitio-users.repository.js.map