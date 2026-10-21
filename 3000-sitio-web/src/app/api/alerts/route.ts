import { proxyToBackend } from '@/shared/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';
/**
 * Proxy de API (BFF - Backend For Frontend) para alertas */

export async function GET(request: Request) { /*Intercepta las solicitudes GET hechas desde la interfaz web*/
  const { search } = new URL(request.url); /*Crea un objeto URL a partir de la URL de la solicitud*/
  return proxyToBackend(`/api/alerts${search}`, request); /*Reenvía la solicitud al backend con la URL modificada*/
}
