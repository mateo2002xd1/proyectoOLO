import axios from 'axios';
import type { RegistroRespaldo } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 8000,
});

/**
 * Consulta el historial de publicaciones y versiones archivadas (respaldos) desde la API backend.
 * Devuelve la lista completa de páginas de ambas aplicaciones o filtrada por ámbito si se especifica.
 */
export async function listarRespaldos(ambito?: 'sitio' | 'intranet'): Promise<RegistroRespaldo[]> {
  const params = ambito ? { ambito } : {};
  const { data } = await api.get<RegistroRespaldo[]>('/api/paginas/respaldos', { params });
  return data;
}

/**
 * Restaura la versión anterior archivada de una página, publicándola de nuevo.
 */
export async function restaurarRespaldo(
  slug: string,
  ambito?: 'sitio' | 'intranet',
  criterio?: { versionId?: string | null; numeroVersion?: number | null }
): Promise<void> {
  const headers = ambito ? { 'X-Ambito': ambito } : {};
  const body = {
    versionId: criterio?.versionId || undefined,
    numeroVersion: criterio?.numeroVersion || undefined,
  };
  await api.post(`/api/paginas/${slug}/restaurar`, body, { headers });
}

/**
 * Consulta si la página actual tiene un candado de edición activo.
 */
export async function verificarBloqueo(slug: string, ambito?: 'sitio' | 'intranet'): Promise<{ bloqueadoPor: any | null }> {
  const headers = ambito ? { 'X-Ambito': ambito } : {};
  const { data } = await api.get<{ bloqueadoPor: any | null }>(`/api/paginas/${slug}/bloqueo`, { headers });
  return data;
}
