import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';
import { normalizarNombreOriginal } from '@olo/upload-policy';
import { subirArchivoDePagina } from '../use-cases/archivos/subir-archivo-de-pagina.usecase';
import { resolverArchivoServible } from '../infrastructure/storage/filesystem';
import type { Ambito } from '../shared/ambito';

/** Un nombre que puso `@olo/upload-policy`: su contenido no cambia nunca. */
const NOMBRE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i;

/**
 * Cuánto puede guardar el navegador cada archivo.
 *
 * - **Intranet**: `private, no-cache`. Se guarda, pero se vuelve a preguntar cada vez;
 *   la respuesta es un 304 sin cuerpo si no cambió, y así el permiso se comprueba siempre.
 * - **Sitio, `uploads/` con nombre UUID**: un año, `immutable`. El nombre lo genera la
 *   subida y nunca se reutiliza, así que esa URL no puede devolver otro contenido. Es lo
 *   que más tráfico ahorra: las imágenes de las páginas públicas.
 * - **El resto del sitio** (`backup/`, nombres anteriores al UUID): se revalida siempre,
 *   porque los archivos entran y salen de `backup/` al publicar y al restaurar.
 */
function cacheControl(ambito: Ambito, segmentos: readonly string[]): string {
  if (ambito === 'intranet') return 'private, no-cache';
  const nombre = segmentos[segmentos.length - 1] ?? '';
  if (segmentos[0] === 'uploads' && NOMBRE_UUID.test(nombre)) {
    return 'public, max-age=31536000, immutable';
  }
  return 'public, no-cache';
}

/**
 * Los adjuntos de las páginas (RF-02): subirlos y servirlos. Lo que se puede subir y
 * servir lo decide `@olo/upload-policy`; dónde vive en disco, `filesystem.ts`.
 */
export const ArchivosController = {
  /** `POST /api/archivos/{ambito}`: guarda el archivo y devuelve su URL `/uploads/...`. */
  subir: (ambito: Ambito) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const archivo = req.file;
      if (!archivo) {
        return res.status(400).json({ error: 'No se envió ningún archivo.' });
      }

      const { url } = await subirArchivoDePagina(archivo.buffer, ambito);

      // La misma forma que devolvía el route handler de cada frontend: los campos de
      // subida del editor leen `url` y `nombreOriginal`.
      //
      // SUB-05: `originalname` lo escribió el navegador de quien subió, tal cual venía
      // en su máquina. Este nombre viaja al contenido de la página y se pinta como texto
      // y como nombre de descarga: sin normalizar, un carácter de control, uno de
      // dirección de texto (RTL) o un nombre larguísimo llegaban intactos a esas
      // pantallas.
      res.json({
        success: true,
        url,
        nombreOriginal: normalizarNombreOriginal(archivo.originalname),
        peso: archivo.size,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * `GET /api/archivos/{ambito}/{uploads|backup}/...`: envía el archivo desde el disco.
   *
   * `sendFile` responde con `ETag`, `Last-Modified` y rangos (`Range`), así que un PDF
   * grande se puede abrir por partes y lo que el navegador ya tiene vuelve como 304.
   */
  servir: (ambito: Ambito) => async (req: Request, res: Response) => {
    // Express 5 entrega el comodín `*ruta` como una lista de segmentos ya decodificados.
    const segmentos = (req.params as unknown as { ruta: string[] }).ruta ?? [];
    const archivo = resolverArchivoServible(ambito, segmentos);

    // Se comprueba antes de poner cabeceras: un 404 con la caché de un año de abajo se
    // quedaría guardado en el navegador aunque el archivo apareciera después.
    const esArchivo = archivo
      ? await fs.stat(archivo.rutaAbsoluta).then((info) => info.isFile(), () => false)
      : false;
    if (!archivo || !esArchivo) return res.status(404).end();

    res.setHeader('Content-Type', archivo.mime);
    res.setHeader('Cache-Control', cacheControl(ambito, segmentos));
    // helmet pone `same-origin` en todo. Lo del sitio es público y se enlaza desde
    // fuera (la intranet, el correo, otros portales), así que ahí se relaja; lo de la
    // intranet se queda como está.
    if (ambito === 'sitio') res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    // La CSP de helmet es para respuestas de la API, no para documentos: con su
    // `object-src 'none'` el visor de PDF del navegador puede quedarse en blanco. Aquí no
    // hace falta, porque solo salen tipos de la lista blanca (sin HTML ni SVG, nada que
    // ejecute script en el origen) y `nosniff`, que helmet sí deja, impide que el
    // navegador los interprete como otra cosa.
    res.removeHeader('Content-Security-Policy');

    res.sendFile(archivo.rutaAbsoluta, { dotfiles: 'deny', cacheControl: false }, (error) => {
      // Se borró entre la comprobación y el envío, o el navegador cortó a medias: en el
      // primer caso todavía no salió nada; en el segundo ya no hay a quién contestar.
      if (error && !res.headersSent) {
        res.removeHeader('Cache-Control');
        res.status(404).end();
      }
    });
  },
};
