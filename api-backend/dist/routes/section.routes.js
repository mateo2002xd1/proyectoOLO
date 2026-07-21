"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const secciones_controller_1 = require("../controllers/secciones.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', secciones_controller_1.SectionController.getAll);
router.get('/:id', secciones_controller_1.SectionController.getById);
router.post('/', secciones_controller_1.SectionController.create);
router.patch('/:id', secciones_controller_1.SectionController.update);
router.delete('/:id', secciones_controller_1.SectionController.delete);
exports.default = router;
//# sourceMappingURL=section.routes.js.map