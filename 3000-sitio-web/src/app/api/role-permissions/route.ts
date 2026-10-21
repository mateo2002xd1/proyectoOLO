import { proxyToBackend } from '@/shared/lib/api/backend-proxy';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // GET /api/role-permissions/role/:roleId
  const url = new URL(request.url);
  const path = '/api/role-permissions' + url.pathname.replace('/api/role-permissions', '');
  return proxyToBackend(path, request);
}

export async function POST(request: NextRequest) {
  return proxyToBackend('/api/role-permissions', request);
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend('/api/role-permissions', request);
}
