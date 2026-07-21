"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenUseCase = exports.loginUseCase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const usuarios_repository_1 = require("../../repositories/usuarios.repository");
const loginUseCase = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (config_1.config.localAuth.email === normalizedEmail &&
        config_1.config.localAuth.password === password) {
        const payload = {
            id: 'local-auth',
            email: normalizedEmail,
            name: config_1.config.localAuth.name,
            role: config_1.config.localAuth.role,
            isLocal: true,
            must_setup_security_questions: false,
            must_change_password: false,
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
        return { token, user: payload };
    }
    const user = await usuarios_repository_1.UserRepository.findByEmail(normalizedEmail);
    if (!user)
        throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
    if (user.status !== 'active')
        throw Object.assign(new Error('Cuenta inactiva o suspendida'), { status: 403 });
    if (user.locked_until && new Date(user.locked_until) > new Date())
        throw Object.assign(new Error('Cuenta bloqueada temporalmente'), { status: 423 });
    if (user.expiration_date && new Date(user.expiration_date) < new Date())
        throw Object.assign(new Error('Cuenta expirada'), { status: 403 });
    const valid = await bcryptjs_1.default.compare(password, user.password_hash || '');
    if (!valid)
        throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
    await usuarios_repository_1.UserRepository.updateLastAccess(user.id);
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.name,
        role_id: user.role_id,
        must_setup_security_questions: user.must_setup_security_questions,
        must_change_password: user.must_change_password,
    };
    const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
    return { token, user: payload };
};
exports.loginUseCase = loginUseCase;
const verifyTokenUseCase = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
};
exports.verifyTokenUseCase = verifyTokenUseCase;
//# sourceMappingURL=login.usecase.js.map