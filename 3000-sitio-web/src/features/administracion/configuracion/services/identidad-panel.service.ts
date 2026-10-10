import axios from 'axios';
import { URL_DE_LA_API } from '@/shared/lib/url-de-la-api';
import type { ColoresDeAccion, IdentidadPanel } from '@/shared/lib/identidad-panel';

const api = axios.create({
  baseURL: URL_DE_LA_API,
  withCredentials: true,
  timeout: 15000,
});

const RUTA = '/api/configuracion/identidad-panel';

export type PiezaDeIdentidad = 'logo' | 'icono';

/**
 * Guarda los colores de las acciones. Se mandan solo las que difieren de fábrica: la API
 * reemplaza el conjunto, y la que no viene vuelve a la de fábrica.
 */
export async function guardarColoresDeAcciones(
  acciones: Partial<Record<string, ColoresDeAccion>>
): Promise<IdentidadPanel> {
  const { data } = await api.patch<IdentidadPanel>(RUTA, { acciones });
  return data;
}

/** Si el logo y el icono subidos pasan a blanco en modo oscuro. */
export async function guardarBlancoEnModoOscuro(blancoEnModoOscuro: boolean): Promise<IdentidadPanel> {
  const { data } = await api.patch<IdentidadPanel>(RUTA, { blancoEnModoOscuro });
  return data;
}

/** Sube el logo o el icono; reemplaza el anterior. */
export async function subirImagenDeIdentidad(pieza: PiezaDeIdentidad, archivo: File): Promise<IdentidadPanel> {
  const formulario = new FormData();
  formulario.append('file', archivo);
  const { data } = await api.post<IdentidadPanel>(`${RUTA}/${pieza}`, formulario);
  return data;
}

/** Vuelve al logo o al icono de fábrica. */
export async function restablecerImagenDeIdentidad(pieza: PiezaDeIdentidad): Promise<IdentidadPanel> {
  const { data } = await api.delete<IdentidadPanel>(`${RUTA}/${pieza}`);
  return data;
}
