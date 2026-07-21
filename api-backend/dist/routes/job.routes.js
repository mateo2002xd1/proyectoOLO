"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trabajos_controller_1 = require("../controllers/trabajos.controller");
const router = (0, express_1.Router)();
router.get('/:id', trabajos_controller_1.TrabajosController.consultarEstado);
router.post('/start-heavy-task', trabajos_controller_1.TrabajosController.encolarTarea);
exports.default = router;
//# sourceMappingURL=job.routes.js.map