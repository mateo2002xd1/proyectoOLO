import axios from 'axios';
import type { DetalleOcupacion, ResultadoOcupacion } from '../types';

/**
 * Cliente del buscador de ocupaciones.
 *
 * Apunta al propio Next (`/api/ocupaciones`, ruta relativa) y no a la API :4000
 * como el resto de services, porque el catálogo CNO todavía se resuelve en el
 * route handler contra `data_temporal/`. Cuando el catálogo viva en la base de
 * datos, ese handler pasará a ser un proxy y este archivo no cambia.
 *
 * Sin `withCredentials`: el catálogo es público y anónimo.
 */
const api = axios.create({ timeout: 15000 });

/**
 * Busca ocupaciones por código, nombre de la ocupación o denominación.
 * @returns lista vacía si el término está en blanco o si la consulta falla.
 */
export async function buscarOcupaciones(termino: string): Promise<ResultadoOcupacion[]> {
  if (!termino.trim()) return [];

  try {
    const { data } = await api.get<ResultadoOcupacion[]>('/api/ocupaciones', {
      params: { q: termino },
    });
    return data;
  } catch {
    return [];
  }
}

/**
 * Detalle completo de una ocupación para la vista ampliada.
 * @returns `null` si la ocupación no existe o si la consulta falla.
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
  } catch {
    return null;
  }
}
