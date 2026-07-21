"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionRepository = void 0;
const models_1 = require("../infrastructure/db/models");
exports.PermissionRepository = {
    findAll: () => models_1.Permission.findAll(),
    findById: (id) => models_1.Permission.findByPk(id),
    findByName: (name) => models_1.Permission.findOne({ where: { name } }),
    create: (data) => models_1.Permission.create(data),
    update: (id, data) => models_1.Permission.update(data, { where: { id }, returning: true }),
    delete: (id) => models_1.Permission.destroy({ where: { id } }),
};
//# sourceMappingURL=permisos.repository.js.map