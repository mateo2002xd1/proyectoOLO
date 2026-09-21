import type { RegistroFuenteFutura } from '../types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Consulta los datos de Fuentes futuras de empleo desde el backend.
 * Lee directamente del archivo fuentes-futuras-de-empleo.xlsx en api-backend/uploads/.
 * Si el archivo aún no existe o el backend no responde, retorna un arreglo vacío [].
 */
export async function obtenerFuentesFuturasEmpleoActual(): Promise<RegistroFuenteFutura[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/observatorio/fuentes-futuras-empleo`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err) {
    console.warn('[fuentes-futuras-empleo] Error al conectar con el backend:', err);
    return [];
  }
}
