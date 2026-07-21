"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const models_1 = require("../infrastructure/db/models");
const config_1 = require("../config");
const sequelize_1 = require("sequelize");
exports.UserRepository = {
    findAll: () => models_1.User.findAll({
        where: { email: { [sequelize_1.Op.ne]: config_1.config.localAuth.email.toLowerCase() } },
        include: [{ model: models_1.Role, as: 'role' }],
        attributes: { exclude: ['password_hash'] },
    }),
    findById: (id) => models_1.User.findByPk(id, {
        include: [{ model: models_1.Role, as: 'role' }],
        attributes: { exclude: ['password_hash'] },
    }),
    findByIdWithPassword: (id) => models_1.User.findByPk(id, { include: [{ model: models_1.Role, as: 'role' }] }),
    findByEmail: (email) => models_1.User.findOne({
        where: { email },
        include: [{ model: models_1.Role, as: 'role' }],
    }),
    create: (data) => models_1.User.create(data),
    update: (id, data) => models_1.User.update(data, { where: { id }, returning: true }),
    delete: (id) => models_1.User.destroy({ where: { id } }),
    updateLastAccess: (id) => models_1.User.update({ last_access_at: new Date() }, { where: { id } }),
};
//# sourceMappingURL=usuarios.repository.js.map