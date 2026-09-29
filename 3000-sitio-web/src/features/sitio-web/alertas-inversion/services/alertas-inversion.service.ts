import type { ListadoPublico, OpcionesAlertasInversion, SeccionConCantidad } from '../types';
import { URL_DE_LA_API } from '@/shared/lib/url-de-la-api';

const BACKEND_URL = URL_DE_LA_API;

/** Proyectos publicados por sector CIIU — pública, sin sesión, directo al backend. */
export async function obtenerGraficoAlertasInversion(anio: string): Promise<SeccionConCantidad[]> {
  const parametros = new URLSearchParams();
  if (anio) parametros.set('anio', anio);
  const res = await fetch(`${BACKEND_URL}/api/alertas-inversion/grafico?${parametros}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudo cargar el gráfico de alertas de inversión.');
  return res.json();
}

export async function obtenerListadoAlertasInversion(filtro: {
  seccion: string;
  anio: string;
  pagina: number;
  porPagina: number;
}): Promise<ListadoPublico> {
  const parametros = new URLSearchParams();
  if (filtro.seccion) parametros.set('seccion', filtro.seccion);
  if (filtro.anio) parametros.set('anio', filtro.anio);
  parametros.set('pagina', String(filtro.pagina));
  parametros.set('porPagina', String(filtro.porPagina));

  const res = await fetch(`${BACKEND_URL}/api/alertas-inversion/listado?${parametros}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudo cargar el listado de proyectos.');
  return res.json();
}

export async function obtenerOpcionesAlertasInversion(): Promise<OpcionesAlertasInversion> {
  const res = await fetch(`${BACKEND_URL}/api/alertas-inversion/opciones`, { cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudieron cargar las opciones de filtro.');
  return res.json();
}
