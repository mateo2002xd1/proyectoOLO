"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityQuestionController = void 0;
const security_questions_usecase_1 = require("../use-cases/auth/security-questions.usecase");
exports.SecurityQuestionController = {
    getCatalog(_req, res) {
        res.json((0, security_questions_usecase_1.getCatalog)());
    },
    async getQuestionKeysForUser(req, res, next) {
        try {
            const { email } = req.body;
            if (!email)
                return res.status(400).json({ error: 'El correo es obligatorio' });
            const questions = await (0, security_questions_usecase_1.getQuestionKeysForUser)(email);
            res.json({ questions });
        }
        catch (err) {
            if (err.status === 404)
                return res.json({ questions: [] });
            next(err);
        }
    },
    async setupQuestions(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ error: 'No autorizado' });
            if (req.user?.isLocal)
                return res.status(403).json({ error: 'El usuario local no puede configurar preguntas' });
            res.json(await (0, security_questions_usecase_1.setupQuestions)(userId, req.body.questions));
        }
        catch (err) {
            next(err);
        }
    },
    async verifyAnswersCtrl(req, res, next) {
        try {
            const { email, answers } = req.body;
            await (0, security_questions_usecase_1.verifyAnswers)(email, answers);
            res.json({ message: 'Respuestas correctas' });
        }
        catch (err) {
            next(err);
        }
    },
    async recoverPasswordCtrl(req, res, next) {
        try {
            const { email, answers, newPassword } = req.body;
            res.json(await (0, security_questions_usecase_1.recoverPassword)(email, answers, newPassword));
        }
        catch (err) {
            if (err.status === 423)
                return res.status(423).json({ error: err.message });
            const safeMessage = 'No fue posible recuperar la contraseña. Verifica los datos e intenta de nuevo.';
            const status = (err.status === 400 || err.status === 401 || err.status === 404) ? 401 : 500;
            res.status(status).json({ error: safeMessage });
        }
    },
};
//# sourceMappingURL=security-questions.controller.js.map