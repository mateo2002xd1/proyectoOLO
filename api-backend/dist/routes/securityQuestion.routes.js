"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const security_questions_controller_1 = require("../controllers/security-questions.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const userQuestionsLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Demasiadas solicitudes. Intente más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const verifyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiadas solicitudes. Intente más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const recoverPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Demasiados intentos de recuperación. Intente más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const email = req.body?.email?.trim().toLowerCase() || 'unknown';
        return `recover:${email}`;
    },
});
router.get('/catalog', security_questions_controller_1.SecurityQuestionController.getCatalog);
router.post('/user-questions', userQuestionsLimiter, security_questions_controller_1.SecurityQuestionController.getQuestionKeysForUser);
router.post('/setup', auth_middleware_1.requireAuth, security_questions_controller_1.SecurityQuestionController.setupQuestions);
router.post('/verify', verifyLimiter, security_questions_controller_1.SecurityQuestionController.verifyAnswersCtrl);
router.post('/recover-password', recoverPasswordLimiter, security_questions_controller_1.SecurityQuestionController.recoverPasswordCtrl);
exports.default = router;
//# sourceMappingURL=securityQuestion.routes.js.map