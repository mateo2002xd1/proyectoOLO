import axios from 'axios';
import type { Data } from '@puckeditor/core';
import { Pagina, PaginaVersion, PaginaEnRevision, Bloque, PuckData, Ambito } from '../types';
import { homeFallbackData } from '../lib/home-fallback-data';

// El sitio y la intranet comparten la tabla `paginas` y ambos tienen su `/inicio`.
// Esta cabecera es lo que le dice a la API a cuál de las dos pertenece cada página.
const AMBITO_HEADERS = { 'X-Ambito': 'sitio' } as const;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 5000,
  headers: AMBITO_HEADERS,
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

/**
 * Contenido editable para el editor: última versión (borrador/en_revisión/
 * publicado/rechazado), no solo la publicada. Nunca 404 — si la página aún no
 * existe, el backend devuelve contenido vacío para arrancar en limpio.
 */
export async function obtenerPaginaEditable(slug: string): Promise<Pagina | null> {
  try {
    const { data } = await api.get(`/api/paginas/${slug}/editable`);
    return data;
  } catch {
    return null;
  }
}

export async function 
obtenerPaginaInicio(): Promise<Data> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/paginas/publica/inicio`, {
      headers: AMBITO_HEADERS,
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

export async function guardarBorrador(slug: string, contenido: PuckData | Bloque[]): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.post(`/api/paginas/${slug}/borrador`, { contenido });
  return data;
}

export async function enviarARevision(slug: string): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.patch(`/api/paginas/${slug}/enviar-revision`);
  return data;
}

/**
 * Al aprobar o rechazar hay que decir sobre qué aplicación se actúa: el mismo slug
 * existe en el sitio y en la intranet, y esta cola reúne las dos. Sin este ámbito
 * explícito se aprobaría siempre la del sitio.
 */
const cabeceraDeAmbito = (ambito: Ambito) => ({ headers: { 'X-Ambito': ambito } });

export async function aprobarPagina(
  slug: string,
  ambito: Ambito = 'sitio'
): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.patch(`/api/paginas/${slug}/aprobar`, undefined, cabeceraDeAmbito(ambito));
  return data;
}

export async function rechazarPagina(
  slug: string,
  motivo: string,
  ambito: Ambito = 'sitio'
): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.patch(
    `/api/paginas/${slug}/rechazar`,
    { motivo },
    cabeceraDeAmbito(ambito)
  );
  return data;
}

/**
 * Descarta una versión sin publicar. Si era la única de la página, la página se
 * elimina con ella y la siguiente edición vuelve a empezar por la versión 1.
 */
export async function eliminarVersion(
  slug: string,
  versionId: string,
  ambito: Ambito = 'sitio'
): Promise<{ paginaEliminada: boolean; versionesRestantes: number }> {
  const { data } = await api.delete(
    `/api/paginas/${slug}/versiones/${versionId}`,
    cabeceraDeAmbito(ambito)
  );
  return data;
}

export async function listarEnRevision(): Promise<PaginaEnRevision[]> {
  const { data } = await api.get('/api/paginas/en-revision');
  return data;
}
