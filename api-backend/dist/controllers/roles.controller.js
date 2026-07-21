"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const roles_usecase_1 = require("../use-cases/usuarios/roles.usecase");
exports.RoleController = {
    async getAll(_req, res, next) {
        try {
            res.json(await (0, roles_usecase_1.getAllRoles)());
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            res.json(await (0, roles_usecase_1.getRoleById)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            res.status(201).json(await (0, roles_usecase_1.createRole)(req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            res.json(await (0, roles_usecase_1.updateRole)(req.params.id, req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            res.json(await (0, roles_usecase_1.deleteRole)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=roles.controller.js.map