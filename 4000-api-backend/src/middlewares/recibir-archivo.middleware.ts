import type { RequestHandler } from 'express';
import multer from 'multer';
import { LIMITE_ABSOLUTO_BYTES } from '@olo/upload-policy';

/**
 * Recibe un archivo en el campo `file`, en memoria, para que lo valide después
 * `@olo/upload-policy`. Lo usan los adjuntos de las páginas (`archivos.routes.ts`) y el
 * logo y el icono del panel (`configuracion.routes.ts`).
 *
 * Lo que supera `limiteBytes` sale como 413 y no como el 500 que daría el error de
 * multer. Es solo el corte grueso: el límite fino (por tipo, por pieza) lo aplica después
 * quien guarda el archivo.
 */
export function recibirArchivo(limiteBytes: number = LIMITE_ABSOLUTO_BYTES): RequestHandler {
  const subidaEnMemoria = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: limiteBytes, files: 1 },
    // El navegador manda el nombre en UTF-8; multer lo lee como latin1 si no se le dice, y
    // «Informe técnico.pdf» llegaba como «Informe tÃ©cnico.pdf». Multer 2 acepta la
    // opción, pero `@types/multer` todavía no la declara: de ahí el `as`.
    defParamCharset: 'utf8',
  } as multer.Options);

  return (req, res, next) => {
    subidaEnMemoria.single('file')(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'El archivo supera el tamaño máximo permitido.' });
      }
      // Cualquier otro error de multer (campo inesperado, demasiados archivos…) es de la
      // petición, no del servidor: sin esto salía como un 500 con el `code` de multer.
      if (error instanceof multer.MulterError) {
        return res.status(400).json({ error: 'La solicitud de subida de archivo no es válida.' });
      }
      next(error);
    });
  };
}
