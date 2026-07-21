"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarios_controller_1 = require("../controllers/usuarios.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', usuarios_controller_1.UserController.getAll);
router.get('/:id', usuarios_controller_1.UserController.getById);
router.post('/', usuarios_controller_1.UserController.create);
router.patch('/:id', usuarios_controller_1.UserController.update);
router.delete('/:id', usuarios_controller_1.UserController.delete);
exports.default = router;
//# sourceMappingURL=user.routes.js.map