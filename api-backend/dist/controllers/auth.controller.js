"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const login_usecase_1 = require("../use-cases/auth/login.usecase");
const first_login_usecase_1 = require("../use-cases/auth/first-login.usecase");
const usuarios_repository_1 = require("../repositories/usuarios.repository");
const listar_usuarios_usecase_1 = require("../use-cases/usuarios/listar-usuarios.usecase");
exports.AuthController = {
    async firstLogin(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ error: 'No autorizado' });
            const { tempPassword, newPassword, securityQuestions } = req.body;
            await (0, first_login_usecase_1.firstLoginUseCase)(userId, tempPassword, newPassword, securityQuestions);
            res.json({ message: 'Configuración completada exitosamente' });
        }
        catch (err) {
            next(err);
        }
    },
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { token, user } = await (0, login_usecase_1.loginUseCase)(email, password);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            const mustChangePassword = user?.must_change_password === true;
            const mustSetupSecurityQuestions = user?.must_setup_security_questions === true;
            res.json({ token, user, mustChangePassword, mustSetupSecurityQuestions });
        }
        catch (err) {
            next(err);
        }
    },
    logout(_req, res) {
        res.clearCookie('token');
        res.json({ message: 'Sesión cerrada' });
    },
    me(req, res) {
        res.json({ user: req.user });
    },
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user?.id;
            if (!currentPassword || !newPassword)
                return res.status(400).json({ error: 'Contraseña actual y nueva son obligatorias' });
            if (newPassword.length < 8)
                return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
            if (req.user?.isLocal)
                return res.status(403).json({ error: 'El usuario local no puede cambiar contraseña' });
            const userWithPw = await usuarios_repository_1.UserRepository.findByIdWithPassword(userId);
            if (!userWithPw)
                return res.status(404).json({ error: 'Usuario no encontrado' });
            const valid = await bcryptjs_1.default.compare(currentPassword, userWithPw.password_hash || '');
            if (!valid)
                return res.status(401).json({ error: 'Contraseña actual incorrecta' });
            await (0, listar_usuarios_usecase_1.updateUser)(userId, { password: newPassword, must_change_password: false });
            res.json({ message: 'Contraseña actualizada correctamente' });
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map