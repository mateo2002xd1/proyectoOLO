"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contenido_controller_1 = require("../controllers/contenido.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/admin/global-lookup', contenido_controller_1.ContenidoController.globalLookup);
router.get('/', contenido_controller_1.ContenidoController.getAll);
router.get('/:id', contenido_controller_1.ContenidoController.getById);
router.post('/', contenido_controller_1.ContenidoController.create);
router.patch('/:id', contenido_controller_1.ContenidoController.update);
router.delete('/:id', contenido_controller_1.ContenidoController.delete);
exports.default = router;
//# sourceMappingURL=contenido.routes.js.map