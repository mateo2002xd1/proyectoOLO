import { proxyToBackend } from '@/shared/lib/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return proxyToBackend(`/api/roles/${params.id}`, request);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return proxyToBackend(`/api/roles/${params.id}`, request);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return proxyToBackend(`/api/roles/${params.id}`, request);
}
