import { proxyToBackend } from '@/shared/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

/**
 * Puerta del panel a la bitácora (RF-07).
 *
 * Se pasa por el proxy de Next y no se llama a `:4000` desde el navegador porque
 * el token vive en una cookie HTTPOnly: el proxy la lee en servidor y la manda
 * como `Authorization`, sin depender de que el navegador comparta cookies entre
 * orígenes. El filtro por rol lo sigue aplicando la API (`requierePermisoAuditoria`).
 */
export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyToBackend(`/api/audit-logs${search}`, request);
}
