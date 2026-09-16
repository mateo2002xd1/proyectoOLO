import axios from 'axios';
import type { CargaDatos } from '../types';

/**
 * Cliente autenticado propio de esta feature — mismo patrón que
 * `features/paginas/services/paginas.service.ts`: `axios` + `withCredentials`,
 * directo al backend (no por un route handler de Next), igual que
 * `aprobarPagina`/`rechazarPagina`.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 15000,
});

/**
 * Mensaje que la API manda en `{ error }` para un fallo controlado, o el de respaldo.
 *
 * Vive aquí y no en el hook porque la forma del error es de axios, y §2.3 deja la
 * conversación con la API dentro del servicio: el hook no tiene por qué saber que
 * debajo hay un `response.data`. Nunca devuelve el error crudo — §6 pide mensaje en
 * español y sin filtrar internals.
 */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (axios.isAxiosError(error)) {
    const detalle = error.response?.data;
    if (detalle && typeof detalle === 'object' && typeof (detalle as { error?: unknown }).error === 'string') {
      return (detalle as { error: string }).error;
    }
  }
  return porDefecto;
}

/** Sube el Excel y arranca la carga de inmediato — sin paso de aprobación (decisión de sesión). */
export async function subirExcelProgramaSobresalientes(archivo: File): Promise<{ cargaId: string }> {
  const formData = new FormData();
  formData.append('file', archivo);
  const { data } = await api.post('/api/observatorio/cargas', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function listarCargasProgramaSobresalientes(): Promise<CargaDatos[]> {
  const { data } = await api.get('/api/observatorio/cargas');
  return data;
}

export async function obtenerCargaProgramaSobresalientes(id: string): Promise<CargaDatos> {
  const { data } = await api.get(`/api/observatorio/cargas/${id}`);
  return data;
}

/** Borra la carga del historial y, si nadie más comparte el archivo, también el Excel de disco. */
export async function eliminarCargaProgramaSobresalientes(id: string): Promise<void> {
  await api.delete(`/api/observatorio/cargas/${id}`);
}
