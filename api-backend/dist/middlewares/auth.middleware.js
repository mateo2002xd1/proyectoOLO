"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const config_1 = require("../config");
const usuarios_repository_1 = require("../repositories/usuarios.repository");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : tokenFromCookie;
    if (!token) {
        console.log('[Auth] Token missing in headers/cookies');
        return res.status(401).json({ error: 'No autenticado' });
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
    }
    catch (err) {
        console.log('[Auth] Token verify failed:', err.message);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    if (decoded.isLocal) {
        req.user = decoded;
        return next();
    }
    try {
        const user = await usuarios_repository_1.UserRepository.findById(decoded.id);
        if (!user)
            return res.status(401).json({ error: 'Usuario no encontrado' });
        if (user.status !== 'active')
            return res.status(401).json({ error: 'Cuenta inactiva o suspendida' });
        if (user.locked_until && new Date(user.locked_until) > new Date())
            return res.status(401).json({ error: 'Cuenta bloqueada temporalmente' });
        if (user.expiration_date && new Date(user.expiration_date) < new Date())
            return res.status(401).json({ error: 'Cuenta expirada' });
    }
    catch (err) {
        return next(err);
    }
    req.user = decoded;
    next();
}
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ error: 'No autenticado' });
        if (!roles.includes(req.user.role || ''))
            return res.status(403).json({ error: 'Acceso denegado' });
        next();
    };
}
//# sourceMappingURL=auth.middleware.js.map