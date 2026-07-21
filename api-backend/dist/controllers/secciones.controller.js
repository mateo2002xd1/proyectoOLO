"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionController = void 0;
const secciones_usecase_1 = require("../use-cases/contenidos/secciones.usecase");
exports.SectionController = {
    async getAll(_req, res, next) {
        try {
            res.json(await (0, secciones_usecase_1.getAllSections)());
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            res.json(await (0, secciones_usecase_1.getSectionById)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            res.status(201).json(await (0, secciones_usecase_1.createSection)(req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            res.json(await (0, secciones_usecase_1.updateSection)(req.params.id, req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            res.json(await (0, secciones_usecase_1.deleteSection)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=secciones.controller.js.map