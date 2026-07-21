"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionController = void 0;
const permisos_usecase_1 = require("../use-cases/usuarios/permisos.usecase");
exports.PermissionController = {
    async getAll(_req, res, next) {
        try {
            res.json(await (0, permisos_usecase_1.getAllPermissions)());
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            res.json(await (0, permisos_usecase_1.getPermissionById)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            res.status(201).json(await (0, permisos_usecase_1.createPermission)(req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            res.json(await (0, permisos_usecase_1.updatePermission)(req.params.id, req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            res.json(await (0, permisos_usecase_1.deletePermission)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=permisos.controller.js.map