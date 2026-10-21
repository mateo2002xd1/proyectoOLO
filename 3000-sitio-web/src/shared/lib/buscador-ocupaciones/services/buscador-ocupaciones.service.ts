import axios from 'axios';
import { estadoHttp, mensajeDeErrorApi } from '@/shared/lib/api/errores-api';
import type { DetalleOcupacion, ResultadoOcupacion } from '../types';

/**
 * Cliente del buscador de ocupaciones.
 *
 * Apunta al propio Next (`/api/ocupaciones`, ruta relativa) y no a la API :4000
 * como el resto de services: el catálogo lo sirve la API pública de consulta
 * CNO/CUOC, y es el route handler del sitio el que le añade la llave. El
 * navegador nunca la ve ni llama a esa API directamente.
 *
 * Sin `withCredentials`: el catálogo es público y anónimo.
 */
const api = axios.create({ timeout: 15000 });

const MENSAJE_POR_DEFECTO = 'No se pudo consultar el catálogo de ocupaciones.';

/**
 * Busca ocupaciones por código, nombre de la ocupación o denominación.
 * @returns lista vacía si el término está en blanco.
 * @throws Error con un mensaje en español, apto para la pantalla, si la consulta falla.
 */
export async function buscarOcupaciones(termino: string): Promise<ResultadoOcupacion[]> {
  if (!termino.trim()) return [];

  try {
    const { data } = await api.get<ResultadoOcupacion[]>('/api/ocupaciones', {
      params: { q: termino },
    });
    return data;
  } catch (error) {
    throw new Error(mensajeDeErrorApi(error, MENSAJE_POR_DEFECTO));
  }
}

/**
 * Detalle completo de una ocupación para la vista ampliada.
 * @returns `null` si la ocupación no existe.
 * @throws Error con un mensaje en español, apto para la pantalla, si la consulta falla.
 */
export async function obtenerDetalleOcupacion(
  codigoOcupacion: string,
): Promise<DetalleOcupacion | null> {
  if (!codigoOcupacion.trim()) return null;

  try {
    const { data } = await api.get<DetalleOcupacion>(
      `/api/ocupaciones/${encodeURIComponent(codigoOcupacion)}`,
    );
    return data;
  } catch (error) {
    if (estadoHttp(error) === 404) return null;
    throw new Error(mensajeDeErrorApi(error, MENSAJE_POR_DEFECTO));
  }
}
