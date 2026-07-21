"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpirationAlerts = exports.deactivateExpiredUsers = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usuarios_repository_1 = require("../../repositories/usuarios.repository");
const roles_repository_1 = require("../../repositories/roles.repository");
const config_1 = require("../../config");
const getAllUsers = () => usuarios_repository_1.UserRepository.findAll();
exports.getAllUsers = getAllUsers;
const getUserById = async (id) => {
    const user = await usuarios_repository_1.UserRepository.findById(id);
    if (!user)
        throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    return user;
};
exports.getUserById = getUserById;
const generateTemporaryPassword = () => crypto_1.default.randomBytes(12).toString('base64url').slice(0, 16);
const createUser = async (data) => {
    const { email, password, role_id, ...rest } = data;
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === config_1.config.localAuth.email.toLowerCase()) {
        throw Object.assign(new Error('Este correo es reservado y está protegido por el sistema'), { status: 403 });
    }
    const existing = await usuarios_repository_1.UserRepository.findByEmail(normalizedEmail);
    if (existing)
        throw Object.assign(new Error('El correo ya está registrado'), { status: 409 });
    const role = await roles_repository_1.RoleRepository.findById(role_id);
    if (!role)
        throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
    const temporaryPassword = generateTemporaryPassword();
    const password_hash = await bcryptjs_1.default.hash(temporaryPassword, 12);
    const user = await usuarios_repository_1.UserRepository.create({
        ...rest,
        email: normalizedEmail,
        password_hash,
        role_id,
        must_change_password: true,
    });
    const userJson = user.toJSON ? user.toJSON() : { ...user };
    userJson.temporaryPassword = temporaryPassword;
    return userJson;
};
exports.createUser = createUser;
const updateUser = async (id, data) => {
    const { password, email, reset_password, reset_security_questions, ...rest } = data;
    const user = await usuarios_repository_1.UserRepository.findById(id);
    if (!user)
        throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    if (user.email === config_1.config.localAuth.email.toLowerCase()) {
        throw Object.assign(new Error('No se puede modificar la cuenta maestra del sistema'), { status: 403 });
    }
    const updateData = { ...rest };
    if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail === config_1.config.localAuth.email.toLowerCase()) {
            throw Object.assign(new Error('Este correo es reservado y está protegido por el sistema'), { status: 403 });
        }
        updateData.email = normalizedEmail;
    }
    if (password)
        updateData.password_hash = await bcryptjs_1.default.hash(password, 12);
    if (reset_security_questions === true) {
        updateData.must_setup_security_questions = true;
    }
    const isReactivation = updateData.status === 'active' && user.status === 'inactive';
    const shouldReset = reset_password || isReactivation;
    if (shouldReset) {
        const temporaryPassword = generateTemporaryPassword();
        updateData.password_hash = await bcryptjs_1.default.hash(temporaryPassword, 12);
        updateData.must_change_password = true;
        await usuarios_repository_1.UserRepository.update(id, updateData);
        const refreshed = await usuarios_repository_1.UserRepository.findById(id);
        if (!refreshed)
            throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
        const resultJson = refreshed.toJSON ? refreshed.toJSON() : { ...refreshed };
        resultJson.temporaryPassword = temporaryPassword;
        return resultJson;
    }
    await usuarios_repository_1.UserRepository.update(id, updateData);
    return usuarios_repository_1.UserRepository.findById(id);
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const user = await usuarios_repository_1.UserRepository.findById(id);
    if (!user)
        throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    if (user.email === config_1.config.localAuth.email.toLowerCase()) {
        throw Object.assign(new Error('No se puede eliminar la cuenta maestra del sistema'), { status: 403 });
    }
    try {
        await usuarios_repository_1.UserRepository.delete(id);
    }
    catch (err) {
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            throw Object.assign(new Error('No se puede eliminar el usuario porque tiene registros o contenido asociado en el sistema. Te recomendamos inactivarlo.'), { status: 409 });
        }
        throw err;
    }
    return { message: 'Usuario eliminado' };
};
exports.deleteUser = deleteUser;
const deactivateExpiredUsers = async () => {
    const users = await usuarios_repository_1.UserRepository.findAll();
    const now = new Date();
    const expiredActiveUsers = users.filter((u) => u.status === 'active' && u.expiration_date && new Date(u.expiration_date) < now);
    for (const user of expiredActiveUsers) {
        await usuarios_repository_1.UserRepository.update(user.id, { status: 'inactive' });
    }
    return { deactivated: expiredActiveUsers.length };
};
exports.deactivateExpiredUsers = deactivateExpiredUsers;
const getExpirationAlerts = async (windowDays = 7) => {
    const users = await usuarios_repository_1.UserRepository.findAll();
    const now = new Date();
    const todayUtcStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    const alerts = users
        .filter((user) => user.status === 'active' && user.expiration_date)
        .map((user) => {
        const expirationDate = new Date(user.expiration_date);
        const expirationUtcStart = Date.UTC(expirationDate.getUTCFullYear(), expirationDate.getUTCMonth(), expirationDate.getUTCDate());
        const daysLeft = Math.floor((expirationUtcStart - todayUtcStart) / msPerDay) + 1;
        return {
            userId: user.id,
            name: user.name,
            email: user.email,
            expiration: `${expirationDate.getUTCFullYear()}-${String(expirationDate.getUTCMonth() + 1).padStart(2, '0')}-${String(expirationDate.getUTCDate()).padStart(2, '0')}`,
            daysLeft,
        };
    })
        .filter((item) => item.daysLeft >= 1 && item.daysLeft <= windowDays)
        .sort((a, b) => a.daysLeft - b.daysLeft);
    return { alerts, count: alerts.length };
};
exports.getExpirationAlerts = getExpirationAlerts;
//# sourceMappingURL=listar-usuarios.usecase.js.map