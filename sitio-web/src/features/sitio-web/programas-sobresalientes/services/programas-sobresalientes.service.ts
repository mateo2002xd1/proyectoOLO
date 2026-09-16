import type { RegistroConDepartamento } from '../types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Los datos vigentes del mapa — pública, sin sesión, directo al backend (sin
 * passar por un route handler de Next, como el resto de lecturas públicas: la
 * API ya responde con CORS abierto a este origen).
 *
 * `cache: 'no-store'` porque se llama desde un hook de cliente (`useEffect`), no
 * desde un Server Component: el `fetch` con `next.revalidate` es para el segundo
 * caso, y aquí no aplica.
 */
export async function obtenerProgramasSobresalientesActual(): Promise<RegistroConDepartamento[]> {
  const res = await fetch(`${BACKEND_URL}/api/observatorio/programas-sobresalientes`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('No se pudieron cargar los datos de formación.');
  }
  return res.json();
}
