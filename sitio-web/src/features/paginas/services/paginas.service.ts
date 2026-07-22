import axios from 'axios';
import type { Data } from '@puckeditor/core';
import { Pagina, PaginaVersion, PaginaEnRevision, Bloque, PuckData } from '../types';
import { homeFallbackData } from '../lib/home-fallback-data';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 5000,
});

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function obtenerPagina(slug: string): Promise<Pagina | null> {
  try {
    const { data } = await api.get(`/api/paginas/publica/${slug}`);
    return data;
  } catch {
    return null;
  }
}

export async function obtenerPaginaInicio(): Promise<Data> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/paginas/publica/inicio`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000), // 5s max — nunca bloquear el inicio
    });
    if (!res.ok) return homeFallbackData;

    const pageData = await res.json();
    if (!pageData?.contenido) return homeFallbackData;

    if (typeof pageData.contenido !== 'string') return pageData.contenido;

    try {
      return JSON.parse(pageData.contenido);
    } catch (err) {
      console.error('Failed to parse pageData.contenido', err);
      return homeFallbackData;
    }
  } catch (err) {
    console.error('Failed to fetch home page data:', err);
    return homeFallbackData;
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

export async function listarEnRevision(): Promise<PaginaEnRevision[]> {
  const { data } = await api.get('/api/paginas/en-revision');
  return data;
}
