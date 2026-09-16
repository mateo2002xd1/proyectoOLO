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
