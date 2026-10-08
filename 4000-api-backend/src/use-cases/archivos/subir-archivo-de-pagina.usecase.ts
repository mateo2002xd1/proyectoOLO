import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
// `file-type` v16 y no la del sitio: ver la nota en `guardar-excel-de-carga.ts`.
import { fromBuffer as detectarTipoDeArchivo } from 'file-type';
import { validarArchivoSubido, fueRechazada, resolverCarpetaPorExtension } from '@olo/upload-policy';
import { resolverDirectorioUploads } from '../../infrastructure/storage/backup-uploads.service';
import type { Ambito } from '../../shared/ambito';

/**
 * Guarda un archivo subido desde el editor (imagen, PDF, Excel…) en `uploads/` del ámbito
 * y devuelve la URL con la que el contenido lo nombra: `/uploads/{tipo}/{uuid}.{ext}`.
 *
 * Hasta el 2026-10-06 esto lo hacía un route handler de cada frontend, que escribía en su
 * propio `public/`. Ahora es el único sitio que escribe adjuntos (`3-seguridad-del-proyecto.md`
 * §S1): los cinco controles de entrada siguen siendo los de `@olo/upload-policy` —tipo
 * real por magic bytes, lista blanca, tamaño por tipo y nombre UUID—, y el archivo cae
 * fuera de cualquier carpeta que un frontend sirva por sí solo.
 *
 * No anota la subida como pendiente: eso lo sigue pidiendo el editor a
 * `POST /api/paginas/{slug}/subidas`, que es quien conoce la página.
 *
 * @throws Error con `status` 400, 413 o 415 si el archivo no pasa la política.
 */
export async function subirArchivoDePagina(datos: Buffer, ambito: Ambito): Promise<{ url: string }> {
  const resultado = await validarArchivoSubido(datos, detectarTipoDeArchivo, () => crypto.randomUUID());

  if (fueRechazada(resultado)) {
    throw Object.assign(new Error(resultado.error), { status: resultado.status });
  }

  // Subcarpeta por tipo (img, pdf, excel…) para que `uploads/` no quede todo mezclado.
  const carpeta = resolverCarpetaPorExtension(resultado.ext);
  const directorio = path.join(resolverDirectorioUploads(ambito), carpeta);
  await fs.mkdir(directorio, { recursive: true });
  await fs.writeFile(path.join(directorio, resultado.nombreArchivo), datos);

  return { url: `/uploads/${carpeta}/${resultado.nombreArchivo}` };
}
