"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityQuestionRepository = void 0;
const models_1 = require("../infrastructure/db/models");
exports.SecurityQuestionRepository = {
    findByUserId: (userId) => models_1.SecurityQuestion.findAll({
        where: { user_id: userId },
        order: [['sort_order', 'ASC']],
    }),
    deleteByUserId: (userId) => models_1.SecurityQuestion.destroy({ where: { user_id: userId } }),
    createBulk: (data) => models_1.SecurityQuestion.bulkCreate(data),
};
//# sourceMappingURL=security-questions.repository.js.map