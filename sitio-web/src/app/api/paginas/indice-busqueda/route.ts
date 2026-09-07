import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de índice de búsqueda para el sitio web público.
 * Consulta al backend únicamente las páginas publicadas con ámbito 'sitio',
 * excluyendo cualquier recurso del panel administrativo o páginas privadas.
 */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/paginas/indice-busqueda`, {
      headers: {
        'x-ambito': 'sitio',
      },
      next: {
        revalidate: 60,
        tags: ['indice-busqueda-sitio'],
      },
    });

    if (!res.ok) {
      console.warn(`[indice-busqueda] Backend respondió con estado ${res.status}`);
      return NextResponse.json([], { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[indice-busqueda] Error al conectar con el backend:', error);
    return NextResponse.json([], { status: 502 });
  }
}
