import { proxyToBackend } from '@/shared/lib/backend-proxy';

/**
 * Recuento de páginas publicadas para el panel general.
 *
 * Pasa por el proxy y no por `axios` contra `:4000` por lo mismo que el resto del panel:
 * la sesión vive en una cookie HttpOnly que solo el servidor puede leer.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return proxyToBackend('/api/paginas/publicadas', request);
}
