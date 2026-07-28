import fs from 'fs';
import path from 'path';
import { AttachmentRepository } from '../../repositories/adjuntos.repository';
import { ContenidoRepository } from '../../repositories/contenido.repository';

/**
 * Acepta tanto los nombres del modelo nuevo como los que usaba `Attachment`, para que
 * el uploader existente siga funcionando mientras se implementa `shared/storage`
 * (RF-02). Cuando ese exista, será él quien construya el archivo y esto se simplifica.
 */
const normalizarArchivo = (datos: any) => ({
  nombreOriginal: datos.nombreOriginal ?? datos.fileName,
  nombreAlmacenado: datos.nombreAlmacenado ?? datos.fileName,
  rutaRelativa: datos.rutaRelativa ?? datos.filePath,
  mimeType: datos.mimeType,
  extension: datos.extension ?? (path.extname(datos.fileName ?? '').replace('.', '') || null),
  tamanoBytes: datos.tamanoBytes ?? datos.sizeBytes,
  hashSha256: datos.hashSha256 ?? null,
  ambito: datos.ambito ?? 'publico',
  estado: datos.estado ?? 'disponible',
  textoAlternativo: datos.textoAlternativo ?? null,
  subidoPor: datos.subidoPor ?? null,
});

export const getAttachmentsByPost = async (contenidoId: string) => {
  const contenido = await ContenidoRepository.findById(contenidoId);
  if (!contenido) throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
  return AttachmentRepository.findByPost(contenidoId);
};

export const createAttachment = async (contenidoId: string, fileData: any) => {
  const contenido = await ContenidoRepository.findById(contenidoId);
  if (!contenido) throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
  return AttachmentRepository.create({ contenidoId, ...normalizarArchivo(fileData) });
};

export const deleteAttachment = async (id: string) => {
  const archivo = await AttachmentRepository.findById(id);
  if (!archivo) throw Object.assign(new Error('Archivo no encontrado'), { status: 404 });

  const rutaAbsoluta = path.resolve((archivo as any).rutaRelativa);
  if (fs.existsSync(rutaAbsoluta)) fs.unlinkSync(rutaAbsoluta);

  await AttachmentRepository.delete(id);
  return { message: 'Archivo eliminado' };
};
