/**
 * Route handler de subida de archivos de sitio-web.
 *
 * Este endpoint no tenía **ningún** control: aceptaba cualquier archivo, de cualquier
 * tamaño, de quien fuera, y lo escribía en `public/uploads` con el nombre que trajera.
 * La corrección de §S1 se había aplicado solo a la intranet, y este quedó fuera de
 * vista con el nombre del cliente llegando al disco: bastaba un bucle para llenarlo, y
 * un `.html` para servir JavaScript desde el propio origen del sitio.
 *
 * Ahora los dos handlers llaman a `@olo/upload-policy`, que es la única copia de la
 * política. Mientras estuvo duplicada, arreglar uno y olvidar el otro fue exactamente
 * lo que pasó.
 *
 * @see 3-seguridad-del-proyecto.md §S1 (Subida de archivos — CRÍTICO)
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

export async function POST(request: Request) {
  // 1. Autenticación con firma verificada, antes de tocar nada.
  try {
    await verificarTokenDesdeRequest(request);
  } catch {
    return NextResponse.json(
      { error: 'No autenticado. Debes iniciar sesión para subir archivos.' },
      { status: 401 }
    );
  }

  try {
    // El `Content-Length` se comprueba antes de leer el cuerpo. `formData()` carga el
    // archivo entero en memoria, así que sin este corte un cuerpo de varios GB era una
    // forma barata de tumbar el proceso aunque después lo fuéramos a rechazar.
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

    // 2-5. Tamaño, magic bytes, lista blanca y nombre UUID: todo en la política común.
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

    return NextResponse.json({
      success: true,
      url: `/uploads/${carpeta}/${resultado.nombreArchivo}`,
    });
  } catch (error) {
    console.error('[upload] Error al procesar archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el archivo.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    if (!esRutaDeSubidaSegura(url, rutaResuelta, DIRECTORIO_DE_SUBIDAS, path.sep)) {
      return NextResponse.json({ error: 'Ruta de archivo inválida.' }, { status: 400 });
    }

    // `rm` con `force` no falla si ya no está: borrar dos veces no es un error que
    // haya que contarle a nadie.
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
