/**
 * Route handler de subida de archivos de la intranet.
 *
 * Los cinco controles de §S1 siguen siendo los mismos, pero ya no viven aquí:
 *
 *   1. AUTENTICACIÓN: JWT verificado con firma criptográfica antes de cualquier
 *      operación de disco. Sin token válido → 401.
 *   2. MAGIC BYTES: el tipo real se detecta con `file-type`, ignorando la extensión
 *      del nombre y el Content-Type declarado, ambos falsificables.
 *   3. LISTA BLANCA: solo PDF, XLSX, XLS, DOCX, DOC, PPT, PPTX, JPG/JPEG y PNG.
 *      SVG excluido (puede contener <script> y ejecutar XSS).
 *   4. LÍMITE DE TAMAÑO verificado en el servidor, no en el cliente.
 *   5. UUID RENAME: el nombre del cliente nunca llega al disco.
 *
 * Del 2 al 5 los aplica ahora `@olo/upload-policy`, compartido con sitio-web. Estaban
 * escritos aquí y **solo** aquí: el handler equivalente del sitio web no tenía
 * ninguno. Con la política duplicada eso vuelve a pasar en cuanto se toque uno de los
 * dos, así que ahora hay una sola copia y los dos handlers la llaman.
 *
 * Deuda técnica documentada: migrar este endpoint a la API :4000 centralizada
 * (ver 3-seguridad-del-proyecto.md §S1). El almacenamiento en public/uploads es
 * aceptable en desarrollo; en producción debe ir a un volumen separado.
 *
 * @see 3-seguridad-del-proyecto.md §S1 (Subida de archivos — CRÍTICO)
 * @see openspec/changes/qa-seguridad-vistas-intranet/specs/qa-intranet-upload-security/spec.md
 */

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import {
  validarArchivoSubido,
  fueRechazada,
  esRutaDeSubidaSegura,
  resolverCarpetaPorExtension,
  LIMITE_ABSOLUTO_BYTES,
} from '@olo/upload-policy';
import { verificarTokenDesdeRequest } from '@/shared/lib/auth-server';

// Físicamente vive en `public/storage/uploads`; la URL pública sigue siendo
// `/uploads/...` de siempre (el rewrite en next.config traduce una en la otra).
const DIRECTORIO_DE_SUBIDAS = path.join(process.cwd(), 'public', 'storage', 'uploads');

// ---------------------------------------------------------------------------
// POST /api/upload — Sube un archivo
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // 1. Autenticación — JWT verificado con firma criptográfica
  try {
    await verificarTokenDesdeRequest(request);
  } catch {
    return NextResponse.json(
      { error: 'No autenticado. Debes iniciar sesión para subir archivos.' },
      { status: 401 }
    );
  }

  try {
    // El `Content-Length` se mira antes de leer el cuerpo: `formData()` carga el
    // archivo entero en memoria, así que rechazar después de leerlo no evita el gasto.
    const largoDeclarado = Number(request.headers.get('content-length') ?? 0);
    if (largoDeclarado > LIMITE_ABSOLUTO_BYTES * 1.1) {
      return NextResponse.json(
        { error: 'El archivo supera el tamaño máximo permitido.' },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    const datos = new Uint8Array(await file.arrayBuffer());

    // 2-5. Magic bytes, lista blanca, límite por tipo y nombre UUID.
    const resultado = await validarArchivoSubido(
      datos,
      fileTypeFromBuffer,
      () => crypto.randomUUID()
    );

    if (fueRechazada(resultado)) {
      return NextResponse.json({ error: resultado.error }, { status: resultado.status });
    }

    // Subcarpeta por tipo (pdf, imagenes, word, excel, presentaciones) para que
    // el listado de `uploads/` no quede todo mezclado en la raíz.
    const carpeta = resolverCarpetaPorExtension(resultado.ext);
    const directorioDestino = path.join(DIRECTORIO_DE_SUBIDAS, carpeta);
    await fs.mkdir(directorioDestino, { recursive: true });
    await fs.writeFile(path.join(directorioDestino, resultado.nombreArchivo), datos);

    const formatearBytesLocal = (bytes: number) => {
      if (!bytes || bytes <= 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    return NextResponse.json({
      success: true,
      url: `/uploads/${carpeta}/${resultado.nombreArchivo}`,
      nombreOriginal: file.name,
      peso: file.size,
      pesoFormateado: formatearBytesLocal(file.size),
    });
  } catch (error) {
    console.error('[upload] Error al procesar archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el archivo.' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/upload — Elimina un archivo subido previamente
// ---------------------------------------------------------------------------

export async function DELETE(request: Request) {
  // 1. Autenticación — misma verificación que el POST
  try {
    await verificarTokenDesdeRequest(request);
  } catch {
    return NextResponse.json(
      { error: 'No autenticado. Debes iniciar sesión para eliminar archivos.' },
      { status: 401 }
    );
  }

  try {
    const { url } = await request.json();
    // `url` sigue trayendo el prefijo público `/uploads/...`; el archivo físico
    // vive en `DIRECTORIO_DE_SUBIDAS` (storage/uploads), no en `public/uploads`.
    const nombreArchivo = typeof url === 'string' ? url.replace(/^\/uploads\//, '') : '';
    const rutaResuelta = path.join(DIRECTORIO_DE_SUBIDAS, nombreArchivo);

    // Prefijo `/uploads/` + ruta ya resuelta dentro del directorio permitido.
    if (!esRutaDeSubidaSegura(url, rutaResuelta, DIRECTORIO_DE_SUBIDAS, path.sep)) {
      return NextResponse.json({ error: 'Ruta de archivo inválida.' }, { status: 400 });
    }

    await fs.rm(rutaResuelta, { force: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[upload] Error al eliminar archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al eliminar el archivo.' },
      { status: 500 }
    );
  }
}
