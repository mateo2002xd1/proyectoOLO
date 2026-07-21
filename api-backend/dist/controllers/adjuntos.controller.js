"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentController = void 0;
const adjuntos_usecase_1 = require("../use-cases/contenidos/adjuntos.usecase");
exports.AttachmentController = {
    async getByPost(req, res, next) {
        try {
            res.json(await (0, adjuntos_usecase_1.getAttachmentsByPost)(req.params.contenidoId));
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            res.status(201).json(await (0, adjuntos_usecase_1.createAttachment)(req.params.contenidoId, req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            res.json(await (0, adjuntos_usecase_1.deleteAttachment)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=adjuntos.controller.js.map