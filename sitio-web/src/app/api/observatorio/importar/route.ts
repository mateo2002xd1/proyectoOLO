import { NextResponse } from 'next/server';
import { verificarTokenDesdeRequest } from '@/shared/lib/auth-server';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth-cookies';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * Recibe el archivo Excel directamente desde el navegador (multipart/form-data),
 * extrae los bytes crudos (ArrayBuffer) en la memoria, y los reenvía al backend
 * como un stream binario. Todo ocurre de forma volátil, sin escribir en el disco.
 */
export async function POST(request: Request) {
  try {
    // 1. Verificación de sesión
    const sesion = await verificarTokenDesdeRequest(request);
    if (!sesion) {
      return NextResponse.json(
        { error: 'No autenticado. Debes iniciar sesión para procesar archivos.' },
        { status: 401 }
      );
    }
    
    // Validar permisos mínimos (acceso al panel o permisos de edición)
    const permisos = (sesion.permisos as string[]) || [];
    const tienePermisos = permisos.some((p: string) => 
      p === 'acceso.panel' || p.startsWith('editar.')
    );

    if (!tienePermisos) {
       return NextResponse.json(
        { error: 'No tienes los permisos necesarios para realizar esta importación.' },
        { status: 403 }
      );
    }

    // 2. Extraer el archivo de la petición HTTP (FormData)
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No se envió ningún archivo válido.' }, { status: 400 });
    }

    // 3. Extraer los datos a memoria (RAM)
    const buffer = await file.arrayBuffer();
    
    // 4. Reenviar los bytes puros al API Backend
    const backendUrl = `${BACKEND_URL}/api/observatorio/importar`;
    
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    const resBackend = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: buffer
    });

    const data = await resBackend.json();

    if (!resBackend.ok) {
      return NextResponse.json({ error: data.error || 'Error en el procesamiento del backend' }, { status: resBackend.status });
    }

    // 5. Devolver resultados
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[observatorio/importar] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al procesar el archivo en memoria.' },
      { status: 500 }
    );
  }
}
