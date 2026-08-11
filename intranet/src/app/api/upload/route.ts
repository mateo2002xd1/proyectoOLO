/**
 * Route handler de subida de archivos — SEGURO.
 *
 * Correcciones implementadas (ver specs/qa-intranet-upload-security/spec.md):
 *
 *   1. AUTENTICACIÓN: JWT verificado con firma criptográfica antes de cualquier
 *      operación de disco. Sin token válido → 401.
 *
 *   2. MAGIC BYTES: el tipo real del archivo se detecta con `file-type`
 *      (inspección de cabeceras binarias), ignorando la extensión del nombre y
 *      el Content-Type declarado por el cliente, ambos falsificables.
 *
 *   3. LISTA BLANCA: solo PDF, XLSX, XLS, DOCX, DOC, JPG/JPEG, PNG son aceptados.
 *      SVG excluido explícitamente (puede contener <script> y ejecutar XSS).
 *
 *   4. LÍMITE DE TAMAÑO: imágenes ≤ 10 MB, documentos ≤ 50 MB, verificado en el
 *      servidor, no en el cliente.
 *
 *   5. UUID RENAME: el nombre del archivo nunca llega al disco. Se usa un UUID v4
 *      + la extensión canónica del tipo real. Previene path traversal.
 *
 * Deuda técnica documentada: migrar este endpoint a la API :4000 centralizada
 * (ver 3-seguridad-del-proyecto.md §S1). El almacenamiento en public/uploads es
 * aceptable en desarrollo; en producción debe ir a un volumen separado.
 *
 * @see 3-seguridad-del-proyecto.md §S1 (Subida de archivos — CRÍTICO)
 * @see openspec/changes/qa-seguridad-vistas-intranet/specs/qa-intranet-upload-security/spec.md
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { verificarTokenDesdeRequest } from '@/shared/lib/auth-server';

// ---------------------------------------------------------------------------
// Lista blanca de tipos MIME aceptados con su extensión canónica y límite
// ---------------------------------------------------------------------------

interface TipoPermitido {
  /** Extensión de archivo a usar en el nombre de salida (sin punto). */
  ext: string;
  /** Límite de tamaño en bytes. */
  maxBytes: number;
}

const TIPOS_PERMITIDOS: Record<string, TipoPermitido> = {
  'image/jpeg':                                                                  { ext: 'jpg',  maxBytes: 10 * 1024 * 1024 },
  'image/png':                                                                   { ext: 'png',  maxBytes: 10 * 1024 * 1024 },
  'application/pdf':                                                             { ext: 'pdf',  maxBytes: 50 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':    { ext: 'docx', maxBytes: 50 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':          { ext: 'xlsx', maxBytes: 50 * 1024 * 1024 },
  'application/msword':                                                          { ext: 'doc',  maxBytes: 50 * 1024 * 1024 },
  'application/vnd.ms-excel':                                                   { ext: 'xls',  maxBytes: 50 * 1024 * 1024 },
  'application/vnd.ms-powerpoint':                                              { ext: 'ppt',  maxBytes: 50 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':  { ext: 'pptx', maxBytes: 50 * 1024 * 1024 },
};

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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 2. Detección del tipo real por magic bytes (ignora extensión y Content-Type)
    const tipoDetectado = await fileTypeFromBuffer(buffer);

    if (!tipoDetectado) {
      return NextResponse.json(
        { error: 'No se pudo determinar el tipo de archivo. Solo se permiten imágenes y documentos.' },
        { status: 415 }
      );
    }

    // 3. Verificación contra la lista blanca
    const tipoPermitido = TIPOS_PERMITIDOS[tipoDetectado.mime];

    if (!tipoPermitido) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${tipoDetectado.mime}. Solo se aceptan: PDF, DOCX, XLSX, JPG, PNG y formatos compatibles.` },
        { status: 415 }
      );
    }

    // 4. Límite de tamaño verificado en el servidor
    if (buffer.length > tipoPermitido.maxBytes) {
      const limiteMB = tipoPermitido.maxBytes / (1024 * 1024);
      return NextResponse.json(
        { error: `El archivo supera el límite de ${limiteMB} MB para este tipo.` },
        { status: 413 }
      );
    }

    // 5. Nombre UUID — el nombre original del cliente nunca llega al disco
    const uuid = crypto.randomUUID();
    const filename = `${uuid}.${tipoPermitido.ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
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

    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Ruta de archivo inválida.' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(process.cwd(), 'public', url);

    // Doble protección: prefijo '/uploads/' + verificación de que el path
    // resuelto esté dentro del directorio de uploads (evita '..' residual).
    if (!filePath.startsWith(uploadDir + path.sep) && filePath !== uploadDir) {
      return NextResponse.json({ error: 'Ruta de archivo inválida.' }, { status: 400 });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[upload] Error al eliminar archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al eliminar el archivo.' },
      { status: 500 }
    );
  }
}
