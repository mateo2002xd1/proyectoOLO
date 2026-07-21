"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const models_1 = require("../infrastructure/db/models");
const sequelize_1 = require("sequelize");
exports.RoleRepository = {
    findAll: () => models_1.Role.findAll({
        where: { name: { [sequelize_1.Op.ne]: 'Superadmin' } },
        include: [{ model: models_1.Permission, as: 'permissions' }]
    }),
    findById: (id) => models_1.Role.findByPk(id, { include: [{ model: models_1.Permission, as: 'permissions' }] }),
    findByName: (name) => models_1.Role.findOne({ where: { name } }),
    create: (data) => models_1.Role.create(data),
    update: (id, data) => models_1.Role.update(data, { where: { id }, returning: true }),
    delete: (id) => models_1.Role.destroy({ where: { id } }),
};
//# sourceMappingURL=roles.repository.js.map