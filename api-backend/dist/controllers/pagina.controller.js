"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginaController = void 0;
const guardar_borrador_usecase_1 = require("../use-cases/paginas/guardar-borrador.usecase");
const enviar_a_revision_usecase_1 = require("../use-cases/paginas/enviar-a-revision.usecase");
const aprobar_pagina_usecase_1 = require("../use-cases/paginas/aprobar-pagina.usecase");
const rechazar_pagina_usecase_1 = require("../use-cases/paginas/rechazar-pagina.usecase");
const obtener_pagina_publica_usecase_1 = require("../use-cases/paginas/obtener-pagina-publica.usecase");
const listar_en_revision_usecase_1 = require("../use-cases/paginas/listar-en-revision.usecase");
exports.PaginaController = {
    async obtenerPublica(req, res, next) {
        try {
            const pagina = await (0, obtener_pagina_publica_usecase_1.obtenerPaginaPublica)(req.params.slug);
            if (!pagina)
                return res.status(404).json({ error: 'Página no encontrada' });
            res.json(pagina);
        }
        catch (err) {
            next(err);
        }
    },
    async guardarBorrador(req, res, next) {
        try {
            const { contenido } = req.body;
            const result = await (0, guardar_borrador_usecase_1.guardarBorrador)(req.params.slug, contenido, req.user?.id || '');
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async enviarARevision(req, res, next) {
        try {
            const result = await (0, enviar_a_revision_usecase_1.enviarARevision)(req.params.slug);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async aprobar(req, res, next) {
        try {
            const result = await (0, aprobar_pagina_usecase_1.aprobarPagina)(req.params.slug, req.user?.id || '');
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async rechazar(req, res, next) {
        try {
            const { motivo } = req.body;
            const result = await (0, rechazar_pagina_usecase_1.rechazarPagina)(req.params.slug, req.user?.id || '', motivo);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async listarEnRevision(_req, res, next) {
        try {
            const result = await (0, listar_en_revision_usecase_1.listarEnRevision)();
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=pagina.controller.js.map