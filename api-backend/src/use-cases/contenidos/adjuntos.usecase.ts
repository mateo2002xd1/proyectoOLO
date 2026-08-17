import fs from 'fs';
import path from 'path';
import { AttachmentRepository } from '../../repositories/adjuntos.repository';
import { obtenerContenidoPorId, type Actor } from './contenido.usecase';
import { exigirPertenencia } from '../../shared/autorizacion';

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

/**
 * Los adjuntos se piden siempre por su contenido, y el contenido decide quién los ve:
 * `obtenerContenidoPorId` ya devuelve 404 si está sin publicar y quien pregunta no es
 * su autor ni tiene permiso para verlo. Reutilizarlo evita que los adjuntos se
 * conviertan en una segunda puerta a lo que la primera no deja pasar.
 */
export const getAttachmentsByPost = async (contenidoId: string, actor?: Actor) => {
  await obtenerContenidoPorId(contenidoId, actor);
  return AttachmentRepository.findByPost(contenidoId);
};

export const createAttachment = async (contenidoId: string, fileData: any, actor?: Actor) => {
  await obtenerContenidoPorId(contenidoId, actor);
  return AttachmentRepository.create({
    contenidoId,
    // `subidoPor` llevaba siempre null porque nadie le pasaba el usuario. La columna
    // existe desde la migración 004 y es lo que permite saber quién subió un archivo.
    ...normalizarArchivo({ subidoPor: actor?.id ?? null, ...fileData }),
  });
};

/**
 * Borra un adjunto **del contenido que dice la URL**.
 *
 * La comprobación de pertenencia es el núcleo de esto. Antes se cargaba el archivo por
 * su id y se ejecutaba `fs.unlinkSync` sobre su ruta sin mirar de qué contenido era:
 * con el id de un adjunto cualquiera se borraba el fichero del disco. Que el archivo
 * exista no autoriza a borrarlo desde aquí; tiene que estar colgado de este contenido.
 *
 * El orden importa: primero se resuelve el contenido (que ya filtra por visibilidad),
 * después la pertenencia, y solo entonces se toca el disco. Nada irreversible ocurre
 * antes de la última comprobación.
 */
export const deleteAttachment = async (contenidoId: string, id: string, actor?: Actor) => {
  await obtenerContenidoPorId(contenidoId, actor);

  const archivo = await AttachmentRepository.findById(id);
  if (!archivo) throw Object.assign(new Error('Archivo no encontrado'), { status: 404 });

  const enlace = await AttachmentRepository.findEnlace(contenidoId, id);
  exigirPertenencia({
    padreReal: enlace?.contenidoId,
    padreEsperado: contenidoId,
    recurso: 'Archivo',
  });

  const rutaAbsoluta = path.resolve((archivo as any).rutaRelativa);
  if (fs.existsSync(rutaAbsoluta)) fs.unlinkSync(rutaAbsoluta);

  await AttachmentRepository.delete(id);
  return { message: 'Archivo eliminado' };
};
