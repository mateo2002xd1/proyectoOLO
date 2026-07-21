import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { AttachmentRepository } from '../../repositories/adjuntos.repository';
import { ContenidoRepository } from '../../repositories/contenido.repository';

export const getAttachmentsByPost = async (contenidoId: string) => {
  const contenido = await ContenidoRepository.findById(contenidoId);
  if (!contenido) throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
  return AttachmentRepository.findByPost(contenidoId);
};

export const createAttachment = async (contenidoId: string, fileData: any) => {
  const contenido = await ContenidoRepository.findById(contenidoId);
  if (!contenido) throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
  return AttachmentRepository.create({ id: randomUUID(), postId: contenidoId, ...fileData });
};

export const deleteAttachment = async (id: string) => {
  const attachment = await AttachmentRepository.findById(id);
  if (!attachment) throw Object.assign(new Error('Archivo no encontrado'), { status: 404 });

  const filePath = path.resolve((attachment as any).filePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await AttachmentRepository.delete(id);
  return { message: 'Archivo eliminado' };
};
