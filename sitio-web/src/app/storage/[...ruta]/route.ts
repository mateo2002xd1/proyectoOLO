/**
 * Sirve desde disco lo que se subió o se movió a `public/storage/` DESPUÉS de arrancar.
 *
 * En producción Next lee la lista de archivos de `public/` una sola vez, al arrancar
 * (`server/lib/router-utils/filesystem.js`), y lo que no está en esa lista no lo sirve:
 * una imagen recién subida daba 404 hasta reiniciar el contenedor. En `next dev` no
 * pasa, por eso no se veía. Lo que ya estaba al arrancar lo sigue sirviendo Next antes
 * de llegar aquí; esta ruta solo recibe lo que él no conoce.
 *
 * Llegan por el rewrite `/uploads/*` y `/backup/*` -> `/storage/*` de `next.config`.
 */
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { mimeParaServir } from '@olo/upload-policy';

const RAIZ = path.join(process.cwd(), 'public', 'storage');
const CARPETAS_SERVIDAS = new Set(['uploads', 'backup']);

export async function GET(_request: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params;
  const rutaAbsoluta = path.resolve(RAIZ, ...ruta);
  const mime = mimeParaServir(rutaAbsoluta);

  if (!CARPETAS_SERVIDAS.has(ruta[0]) || !mime || !rutaAbsoluta.startsWith(RAIZ + path.sep)) {
    return new Response(null, { status: 404 });
  }

  let tamano: number;
  try {
    const info = await fs.promises.stat(rutaAbsoluta);
    if (!info.isFile()) return new Response(null, { status: 404 });
    tamano = info.size;
  } catch {
    return new Response(null, { status: 404 });
  }

  const cuerpo = Readable.toWeb(fs.createReadStream(rutaAbsoluta)) as ReadableStream;
  return new Response(cuerpo, {
    headers: {
      'Content-Type': mime,
      'Content-Length': String(tamano),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
