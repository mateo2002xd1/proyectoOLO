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
