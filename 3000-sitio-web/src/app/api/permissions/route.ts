import { proxyToBackend } from '@/shared/lib/backend-proxy';

export const dynamic = 'force-dynamic';

// El catálogo de permisos es de solo lectura: la API ya no admite altas a mano.
export async function GET(request: Request) {
  return proxyToBackend('/api/permissions', request);
}
