"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContenidoController = void 0;
const contenido_usecase_1 = require("../use-cases/contenidos/contenido.usecase");
const audit_usecase_1 = require("../use-cases/auditoria/audit.usecase");
exports.ContenidoController = {
    async getAll(req, res, next) {
        try {
            const where = {};
            if (req.query.sectionId)
                where.sectionId = req.query.sectionId;
            if (req.query.published === 'true') {
                const { Op } = require('sequelize');
                where.publishedAt = { [Op.ne]: null };
            }
            res.json(await (0, contenido_usecase_1.obtenerContenidos)(where));
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            res.json(await (0, contenido_usecase_1.obtenerContenidoPorId)(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            const result = await (0, contenido_usecase_1.crearContenido)(req.body, req.user?.id);
            (0, audit_usecase_1.logAudit)({
                contentId: result.id,
                contentType: 'contenido',
                userId: req.user?.id,
                userName: req.user?.name || req.user?.email,
                actionType: 'create',
                modifiedFields: Object.keys(req.body).map((k) => ({ field: k, old: null, new: req.body[k] })),
            });
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            const result = await (0, contenido_usecase_1.actualizarContenido)(req.params.id, req.body);
            (0, audit_usecase_1.logAudit)({
                contentId: req.params.id,
                contentType: 'contenido',
                userId: req.user?.id,
                userName: req.user?.name || req.user?.email,
                actionType: 'update',
                modifiedFields: Object.keys(req.body).map((k) => ({ field: k, old: null, new: req.body[k] })),
            });
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async globalLookup(req, res, next) {
        try {
            res.json(await (0, contenido_usecase_1.buscarContenidoGlobal)(req.query.term));
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            const result = await (0, contenido_usecase_1.eliminarContenido)(req.params.id);
            (0, audit_usecase_1.logAudit)({
                contentId: req.params.id,
                contentType: 'contenido',
                userId: req.user?.id,
                userName: req.user?.name || req.user?.email,
                actionType: 'delete',
                modifiedFields: [],
            });
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=contenido.controller.js.map