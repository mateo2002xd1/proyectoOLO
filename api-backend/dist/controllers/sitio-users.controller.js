"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitioUserController = void 0;
const sitio_users_usecase_1 = require("../use-cases/usuarios/sitio-users.usecase");
exports.SitioUserController = {
    async getAll(_req, res, next) {
        try {
            res.json(await (0, sitio_users_usecase_1.getAllSitioUsers)());
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            res.json(await (0, sitio_users_usecase_1.getSitioUserById)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            res.status(201).json(await (0, sitio_users_usecase_1.createSitioUser)(req.body, req.user?.id));
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            res.json(await (0, sitio_users_usecase_1.updateSitioUser)(req.params.id, req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            res.json(await (0, sitio_users_usecase_1.deleteSitioUser)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
    async login(req, res, next) {
        try {
            res.json(await (0, sitio_users_usecase_1.loginSitioUser)(req.body.email, req.body.password));
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=sitio-users.controller.js.map