"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.createAttachment = exports.getAttachmentsByPost = void 0;
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const adjuntos_repository_1 = require("../../repositories/adjuntos.repository");
const contenido_repository_1 = require("../../repositories/contenido.repository");
const getAttachmentsByPost = async (contenidoId) => {
    const contenido = await contenido_repository_1.ContenidoRepository.findById(contenidoId);
    if (!contenido)
        throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
    return adjuntos_repository_1.AttachmentRepository.findByPost(contenidoId);
};
exports.getAttachmentsByPost = getAttachmentsByPost;
const createAttachment = async (contenidoId, fileData) => {
    const contenido = await contenido_repository_1.ContenidoRepository.findById(contenidoId);
    if (!contenido)
        throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
    return adjuntos_repository_1.AttachmentRepository.create({ id: (0, crypto_1.randomUUID)(), postId: contenidoId, ...fileData });
};
exports.createAttachment = createAttachment;
const deleteAttachment = async (id) => {
    const attachment = await adjuntos_repository_1.AttachmentRepository.findById(id);
    if (!attachment)
        throw Object.assign(new Error('Archivo no encontrado'), { status: 404 });
    const filePath = path_1.default.resolve(attachment.filePath);
    if (fs_1.default.existsSync(filePath))
        fs_1.default.unlinkSync(filePath);
    await adjuntos_repository_1.AttachmentRepository.delete(id);
    return { message: 'Archivo eliminado' };
};
exports.deleteAttachment = deleteAttachment;
//# sourceMappingURL=adjuntos.usecase.js.map