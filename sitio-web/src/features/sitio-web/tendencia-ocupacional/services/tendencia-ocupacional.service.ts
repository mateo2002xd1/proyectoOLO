import type { RegistroTendenciaOcupacional, TipoTendenciaOcupacional } from '../types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Consulta los datos vigentes del Excel de tendencia ocupacional según el tipo/cuadrante.
 * Si el backend no responde o el archivo no existe, retorna una lista vacía.
 */
export async function obtenerTendenciaOcupacionalActual(
  tipo: TipoTendenciaOcupacional = 'mas-menos'
): Promise<RegistroTendenciaOcupacional[]> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/observatorio/tendencia-ocupacional?tipo=${encodeURIComponent(tipo)}`,
      {
        cache: 'no-store',
      }
    );
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err) {
    console.warn('[tendencia-ocupacional] Error al conectar con el backend:', err);
    return [];
  }
}
