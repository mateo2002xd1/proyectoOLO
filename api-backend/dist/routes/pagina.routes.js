"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pagina_controller_1 = require("../controllers/pagina.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const cache_middleware_1 = require("../middlewares/cache.middleware");
const router = (0, express_1.Router)();
router.get('/publica/:slug', (0, cache_middleware_1.cacheInterceptor)(300), pagina_controller_1.PaginaController.obtenerPublica);
router.use(auth_middleware_1.requireAuth);
router.post('/:slug/borrador', pagina_controller_1.PaginaController.guardarBorrador);
router.patch('/:slug/enviar-revision', pagina_controller_1.PaginaController.enviarARevision);
router.patch('/:slug/aprobar', pagina_controller_1.PaginaController.aprobar);
router.patch('/:slug/rechazar', pagina_controller_1.PaginaController.rechazar);
router.get('/en-revision', pagina_controller_1.PaginaController.listarEnRevision);
exports.default = router;
//# sourceMappingURL=pagina.routes.js.map