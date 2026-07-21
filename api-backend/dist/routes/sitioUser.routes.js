"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sitio_users_controller_1 = require("../controllers/sitio-users.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/login', sitio_users_controller_1.SitioUserController.login);
router.use(auth_middleware_1.requireAuth);
router.get('/', sitio_users_controller_1.SitioUserController.getAll);
router.get('/:id', sitio_users_controller_1.SitioUserController.getById);
router.post('/', sitio_users_controller_1.SitioUserController.create);
router.patch('/:id', sitio_users_controller_1.SitioUserController.update);
router.delete('/:id', sitio_users_controller_1.SitioUserController.delete);
exports.default = router;
//# sourceMappingURL=sitioUser.routes.js.map