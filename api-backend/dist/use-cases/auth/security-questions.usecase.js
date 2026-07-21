"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoverPassword = exports.verifyAnswers = exports.setupQuestions = exports.getQuestionKeysForUser = exports.getCatalog = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usuarios_repository_1 = require("../../repositories/usuarios.repository");
const security_questions_repository_1 = require("../../repositories/security-questions.repository");
const SECURITY_QUESTIONS_CATALOG = [
    { key: 'pet_name', label: '¿Cuál es el nombre de tu primera mascota?' },
    { key: 'birth_city', label: '¿En qué ciudad naciste?' },
    { key: 'childhood_friend', label: '¿Cuál es el nombre de tu mejor amigo de la infancia?' },
    { key: 'favorite_food', label: '¿Cuál es tu comida favorita?' },
    { key: 'first_school', label: '¿Cuál fue el nombre de tu primera escuela?' },
    { key: 'mother_middle_name', label: '¿Cuál es el segundo nombre de tu madre?' },
    { key: 'first_phone', label: '¿Cuál fue tu primer número de teléfono?' },
    { key: 'favorite_movie', label: '¿Cuál es tu película favorita?' },
    { key: 'graduation_year', label: '¿En qué año te graduaste?' },
    { key: 'childhood_street', label: '¿Cuál es el nombre de la calle donde creciste?' },
];
const getCatalog = () => SECURITY_QUESTIONS_CATALOG;
exports.getCatalog = getCatalog;
const getQuestionKeysForUser = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await usuarios_repository_1.UserRepository.findByEmail(normalizedEmail);
    if (!user)
        throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    if (user.locked_until && new Date(user.locked_until) > new Date())
        throw Object.assign(new Error('Cuenta bloqueada temporalmente'), { status: 423 });
    const questions = await security_questions_repository_1.SecurityQuestionRepository.findByUserId(user.id);
    if (!questions || questions.length === 0)
        return [];
    return questions.map((q) => ({
        key: q.question_key,
        label: SECURITY_QUESTIONS_CATALOG.find((c) => c.key === q.question_key)?.label || q.question_key,
    }));
};
exports.getQuestionKeysForUser = getQuestionKeysForUser;
const setupQuestions = async (userId, questionsData) => {
    if (!Array.isArray(questionsData) || questionsData.length !== 3)
        throw Object.assign(new Error('Debe proporcionar exactamente 3 preguntas'), { status: 400 });
    const uniqueKeys = new Set(questionsData.map((q) => q.key));
    if (uniqueKeys.size !== 3)
        throw Object.assign(new Error('Las preguntas deben ser diferentes'), { status: 400 });
    await security_questions_repository_1.SecurityQuestionRepository.deleteByUserId(userId);
    const questionsToCreate = [];
    for (let i = 0; i < questionsData.length; i++) {
        const q = questionsData[i];
        if (!q.answer || typeof q.answer !== 'string' || q.answer.trim().length < 1)
            throw Object.assign(new Error('Las respuestas no pueden estar vacías'), { status: 400 });
        if (q.answer.length > 500)
            throw Object.assign(new Error('Las respuestas son demasiado largas'), { status: 400 });
        const answerHash = await bcryptjs_1.default.hash(q.answer.trim().toLowerCase(), 12);
        questionsToCreate.push({
            user_id: userId,
            question_key: q.key,
            answer_hash: answerHash,
            sort_order: i,
        });
    }
    await security_questions_repository_1.SecurityQuestionRepository.createBulk(questionsToCreate);
    await usuarios_repository_1.UserRepository.update(userId, { must_setup_security_questions: false });
    return { message: 'Preguntas de seguridad configuradas exitosamente' };
};
exports.setupQuestions = setupQuestions;
const verifyAnswers = async (email, answersData) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await usuarios_repository_1.UserRepository.findByEmail(normalizedEmail);
    if (!user)
        throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    if (user.locked_until && new Date(user.locked_until) > new Date())
        throw Object.assign(new Error('Cuenta bloqueada temporalmente'), { status: 423 });
    const storedQuestions = await security_questions_repository_1.SecurityQuestionRepository.findByUserId(user.id);
    if (!storedQuestions || storedQuestions.length !== 3)
        throw Object.assign(new Error('El usuario no tiene preguntas configuradas'), { status: 400 });
    if (!Array.isArray(answersData) || answersData.length !== 3)
        throw Object.assign(new Error('Debe proporcionar respuestas a las 3 preguntas'), { status: 400 });
    for (const stored of storedQuestions) {
        const provided = answersData.find((a) => a.key === stored.question_key);
        if (!provided)
            throw Object.assign(new Error('Falta una o más respuestas'), { status: 400 });
        if (!provided.answer || typeof provided.answer !== 'string' || provided.answer.trim().length < 1)
            throw Object.assign(new Error('Las respuestas no pueden estar vacías'), { status: 400 });
        const isValid = await bcryptjs_1.default.compare(provided.answer.trim().toLowerCase(), stored.answer_hash);
        if (!isValid) {
            const newCount = (user.failed_security_attempts || 0) + 1;
            const updates = { failed_security_attempts: newCount };
            if (newCount >= 3)
                updates.locked_until = new Date(Date.now() + 30 * 60 * 1000);
            await usuarios_repository_1.UserRepository.update(user.id, updates);
            throw Object.assign(new Error('Una o más respuestas son incorrectas'), { status: 401 });
        }
    }
    if (user.failed_security_attempts > 0 || user.locked_until) {
        await usuarios_repository_1.UserRepository.update(user.id, { failed_security_attempts: 0, locked_until: null });
    }
    return user;
};
exports.verifyAnswers = verifyAnswers;
const recoverPassword = async (email, answersData, newPassword) => {
    if (!newPassword || newPassword.length < 8)
        throw Object.assign(new Error('La nueva contraseña debe tener al menos 8 caracteres'), { status: 400 });
    const user = await (0, exports.verifyAnswers)(email, answersData);
    const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
    await usuarios_repository_1.UserRepository.update(user.id, {
        password_hash: passwordHash,
        failed_security_attempts: 0,
        locked_until: null,
    });
    return { message: 'Contraseña actualizada exitosamente' };
};
exports.recoverPassword = recoverPassword;
//# sourceMappingURL=security-questions.usecase.js.map