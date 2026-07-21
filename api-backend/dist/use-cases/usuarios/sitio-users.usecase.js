"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSitioUser = exports.deleteSitioUser = exports.updateSitioUser = exports.createSitioUser = exports.getSitioUserById = exports.getAllSitioUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const sitio_users_repository_1 = require("../../repositories/sitio-users.repository");
const getAllSitioUsers = () => sitio_users_repository_1.SitioUserRepository.findAll();
exports.getAllSitioUsers = getAllSitioUsers;
const getSitioUserById = async (id) => {
    const user = await sitio_users_repository_1.SitioUserRepository.findById(id);
    if (!user)
        throw Object.assign(new Error('Usuario de sitio no encontrado'), { status: 404 });
    return user;
};
exports.getSitioUserById = getSitioUserById;
const createSitioUser = async (data, createdBy) => {
    const { email, password, ...rest } = data;
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await sitio_users_repository_1.SitioUserRepository.findByEmail(normalizedEmail);
    if (existing)
        throw Object.assign(new Error('El correo ya está registrado en sitio'), { status: 409 });
    const password_hash = password ? await bcryptjs_1.default.hash(password, 12) : null;
    const user = await sitio_users_repository_1.SitioUserRepository.create({
        ...rest,
        email: normalizedEmail,
        password_hash,
        created_by: createdBy || null,
    });
    const result = user.toJSON ? user.toJSON() : { ...user };
    delete result.password_hash;
    return result;
};
exports.createSitioUser = createSitioUser;
const updateSitioUser = async (id, data) => {
    const { password, email, ...rest } = data;
    const user = await sitio_users_repository_1.SitioUserRepository.findById(id);
    if (!user)
        throw Object.assign(new Error('Usuario de sitio no encontrado'), { status: 404 });
    const updateData = { ...rest };
    if (email)
        updateData.email = email.trim().toLowerCase();
    if (password)
        updateData.password_hash = await bcryptjs_1.default.hash(password, 12);
    await sitio_users_repository_1.SitioUserRepository.update(id, updateData);
    return sitio_users_repository_1.SitioUserRepository.findById(id);
};
exports.updateSitioUser = updateSitioUser;
const deleteSitioUser = async (id) => {
    const user = await sitio_users_repository_1.SitioUserRepository.findById(id);
    if (!user)
        throw Object.assign(new Error('Usuario de sitio no encontrado'), { status: 404 });
    await sitio_users_repository_1.SitioUserRepository.delete(id);
    return { message: 'Usuario de sitio eliminado' };
};
exports.deleteSitioUser = deleteSitioUser;
const loginSitioUser = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await sitio_users_repository_1.SitioUserRepository.findByEmail(normalizedEmail);
    if (!user)
        throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
    if (user.status !== 'active')
        throw Object.assign(new Error('Cuenta inactiva o suspendida'), { status: 403 });
    const valid = await bcryptjs_1.default.compare(password, user.password_hash || '');
    if (!valid)
        throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
    await sitio_users_repository_1.SitioUserRepository.updateLastLogin(user.id);
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        type: 'sitio',
    };
    const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSiteSecret, { expiresIn: config_1.config.jwtExpiresIn });
    return { token, user: payload };
};
exports.loginSitioUser = loginSitioUser;
//# sourceMappingURL=sitio-users.usecase.js.map