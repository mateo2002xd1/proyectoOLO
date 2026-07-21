"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentRepository = void 0;
const models_1 = require("../infrastructure/db/models");
exports.AttachmentRepository = {
    findByPost: (postId) => models_1.Attachment.findAll({ where: { postId }, order: [['createdAt', 'ASC']] }),
    findById: (id) => models_1.Attachment.findByPk(id),
    create: (data) => models_1.Attachment.create(data),
    delete: (id) => models_1.Attachment.destroy({ where: { id } }),
    deleteByPost: (postId) => models_1.Attachment.destroy({ where: { postId } }),
};
//# sourceMappingURL=adjuntos.repository.js.map