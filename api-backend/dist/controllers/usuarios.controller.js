"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const listar_usuarios_usecase_1 = require("../use-cases/usuarios/listar-usuarios.usecase");
exports.UserController = {
    async getExpirationAlerts(req, res, next) {
        try {
            const windowDaysRaw = Number.parseInt(String(req.query.windowDays ?? '7'), 10);
            const windowDays = Number.isNaN(windowDaysRaw) ? 7 : Math.max(1, Math.min(windowDaysRaw, 30));
            res.json(await (0, listar_usuarios_usecase_1.getExpirationAlerts)(windowDays));
        }
        catch (err) {
            next(err);
        }
    },
    async getAll(_req, res, next) {
        try {
            res.json(await (0, listar_usuarios_usecase_1.getAllUsers)());
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            res.json(await (0, listar_usuarios_usecase_1.getUserById)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            res.status(201).json(await (0, listar_usuarios_usecase_1.createUser)(req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            res.json(await (0, listar_usuarios_usecase_1.updateUser)(req.params.id, req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            res.json(await (0, listar_usuarios_usecase_1.deleteUser)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=usuarios.controller.js.map