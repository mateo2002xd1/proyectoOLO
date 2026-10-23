import { proxyToBackend } from '@/shared/lib/api/backend-proxy';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/api/users/${encodeURIComponent(id)}`, request);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/api/users/${encodeURIComponent(id)}`, request);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/api/users/${encodeURIComponent(id)}`, request);
}
