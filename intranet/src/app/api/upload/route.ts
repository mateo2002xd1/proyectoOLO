import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Create a safe filename with timestamp
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    
    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar el archivo.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Ruta de archivo inválida.' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(process.cwd(), 'public', url);

    // El prefijo ya lo filtra, pero esto además bloquea ".." dentro de la ruta.
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json({ error: 'Ruta de archivo inválida.' }, { status: 400 });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return NextResponse.json({ error: 'Error interno del servidor al eliminar el archivo.' }, { status: 500 });
  }
}
