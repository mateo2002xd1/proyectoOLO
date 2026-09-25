import { proxyToBackend } from '@/shared/lib/backend-proxy';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/role-permissions/role/[roleId] → backend /api/role-permissions/role/:roleId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  return proxyToBackend(`/api/role-permissions/role/${roleId}`, request);
}
