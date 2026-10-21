import { proxyToBackend } from '@/shared/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return proxyToBackend('/api/users', request);
}

export async function POST(request: Request) {
  return proxyToBackend('/api/users', request);
}
