import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/shared/lib/backend-proxy';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

const RUTAS_PERMITIDAS = [
  '/api/me',
  '/api/paginas',
  '/api/observatorio',
  '/api/alertas-inversion',
  '/api/configuracion',
];

async function reenviar(request: Request, { params }: RouteContext) {
  const { path: segmentos } = await params;
  const ruta = `/${segmentos.join('/')}`;

  const rutaPermitida = RUTAS_PERMITIDAS.some(
    (prefijo) => ruta === prefijo || ruta.startsWith(`${prefijo}/`)
  );
  if (!rutaPermitida) {
    return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 });
  }

  const busqueda = new URL(request.url).search;
  return proxyToBackend(`${ruta}${busqueda}`, request);
}

export const GET = reenviar;
export const POST = reenviar;
export const PATCH = reenviar;
export const DELETE = reenviar;
