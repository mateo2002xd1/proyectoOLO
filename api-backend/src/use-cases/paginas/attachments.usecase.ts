import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { AttachmentRepository } from '../../repositories/adjuntos.repository';
import { PostRepository } from '../../repositories/paginas.repository';

export const getAttachmentsByPost = async (postId: string) => {
  const post = await PostRepository.findById(postId);
  if (!post) throw Object.assign(new Error('Post no encontrado'), { status: 404 });
  return AttachmentRepository.findByPost(postId);
};

export const createAttachment = async (postId: string, fileData: any) => {
  const post = await PostRepository.findById(postId);
  if (!post) throw Object.assign(new Error('Post no encontrado'), { status: 404 });
  return AttachmentRepository.create({ id: randomUUID(), postId, ...fileData });
};

export const deleteAttachment = async (id: string) => {
  const attachment = await AttachmentRepository.findById(id);
  if (!attachment) throw Object.assign(new Error('Archivo no encontrado'), { status: 404 });

  const filePath = path.resolve((attachment as any).filePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await AttachmentRepository.delete(id);
  return { message: 'Archivo eliminado' };
};
