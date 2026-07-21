import axios from 'axios';
import { Pagina, PaginaVersion, Bloque, PuckData } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 5000,
});

export async function obtenerPagina(slug: string): Promise<Pagina | null> {
  try {
    const { data } = await api.get(`/api/paginas/publica/${slug}`);
    return data;
  } catch {
    return null;
  }
}

export async function guardarBorrador(slug: string, contenido: PuckData | Bloque[]): Promise<{ pagina: any; version: PaginaVersion }> {
  const { data } = await api.post(`/api/paginas/${slug}/borrador`, { contenido });
  return data;
}

export async function enviarARevision(slug: string): Promise<{ pagina: any; version: PaginaVersion }> {
  const { data } = await api.patch(`/api/paginas/${slug}/enviar-revision`);
  return data;
}

export async function aprobarPagina(slug: string): Promise<{ pagina: any; version: PaginaVersion }> {
  const { data } = await api.patch(`/api/paginas/${slug}/aprobar`);
  return data;
}

export async function rechazarPagina(slug: string, motivo: string): Promise<{ pagina: any; version: PaginaVersion }> {
  const { data } = await api.patch(`/api/paginas/${slug}/rechazar`, { motivo });
  return data;
}
