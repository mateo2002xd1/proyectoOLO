"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstLoginUseCase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usuarios_repository_1 = require("../../repositories/usuarios.repository");
const security_questions_repository_1 = require("../../repositories/security-questions.repository");
const firstLoginUseCase = async (userId, tempPassword, newPassword, securityQuestions) => {
    const user = await usuarios_repository_1.UserRepository.findByIdWithPassword(userId);
    if (!user)
        throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    // 1. Verify the temporary password
    const valid = await bcryptjs_1.default.compare(tempPassword, user.password_hash || '');
    if (!valid)
        throw Object.assign(new Error('La contraseña temporal es incorrecta'), { status: 401 });
    // 2. Hash the new password
    if (!newPassword || newPassword.length < 8) {
        throw Object.assign(new Error('La nueva contraseña debe tener al menos 8 caracteres'), { status: 400 });
    }
    const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
    // 3. Validate security questions
    if (!Array.isArray(securityQuestions) || securityQuestions.length !== 3) {
        throw Object.assign(new Error('Debe proporcionar exactamente 3 preguntas de seguridad'), { status: 400 });
    }
    const uniqueKeys = new Set(securityQuestions.map((q) => q.key));
    if (uniqueKeys.size !== 3) {
        throw Object.assign(new Error('Las preguntas de seguridad deben ser diferentes'), { status: 400 });
    }
    // 4. Save everything in a transaction or sequentially
    await security_questions_repository_1.SecurityQuestionRepository.deleteByUserId(userId);
    const questionsToCreate = [];
    for (let i = 0; i < securityQuestions.length; i++) {
        const q = securityQuestions[i];
        if (!q.answer || typeof q.answer !== 'string' || q.answer.trim().length < 1)
            throw Object.assign(new Error('Las respuestas no pueden estar vacías'), { status: 400 });
        if (q.answer.length > 500)
            throw Object.assign(new Error('Las respuestas son demasiado largas'), { status: 400 });
        const answerHash = await bcryptjs_1.default.hash(q.answer.trim().toLowerCase(), 12);
        questionsToCreate.push({
            user_id: userId,
            question_key: q.key,
            answer_hash: answerHash,
        });
    }
    await security_questions_repository_1.SecurityQuestionRepository.createBulk(questionsToCreate);
    // 5. Update the user flags
    await usuarios_repository_1.UserRepository.update(userId, {
        password_hash: passwordHash,
        must_change_password: false,
        must_setup_security_questions: false,
    });
    return { success: true };
};
exports.firstLoginUseCase = firstLoginUseCase;
//# sourceMappingURL=first-login.usecase.js.map