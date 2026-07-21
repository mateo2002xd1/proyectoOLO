"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Demasiados intentos de inicio de sesión. Intente más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const logoutLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas solicitudes. Intente más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const router = (0, express_1.Router)();
router.post('/login', loginLimiter, auth_controller_1.AuthController.login);
router.post('/first-login', auth_middleware_1.requireAuth, auth_controller_1.AuthController.firstLogin);
router.post('/logout', logoutLimiter, auth_controller_1.AuthController.logout);
router.get('/me', auth_middleware_1.requireAuth, auth_controller_1.AuthController.me);
router.post('/change-password', auth_middleware_1.requireAuth, auth_controller_1.AuthController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map