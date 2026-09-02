/**
 * Contratos del historial de publicaciones (respaldos).
 *
 * Cada registro es un evento de publicación: la versión que quedó publicada y,
 * si existía, la versión anterior que esa publicación reemplazó (el "respaldo").
 * Espejo pendiente del DTO real de la API — hoy el servicio devuelve datos de
 * ejemplo (ver `services/respaldos.service.ts`).
 */

export interface AutorRespaldo {
  id: string;
  nombre: string;
  email: string;
}

export interface RegistroRespaldo {
  id: string;
  paginaId: string;
  titulo: string;
  slug: string;
  ambito?: 'sitio' | 'intranet';
  numeroVersion: number;
  /** `null` cuando la versión publicada es la primera: no hay nada que respaldar. */
  versionAnteriorNumero: number | null;
  versionAnteriorId?: string | null;
  editadoPor: AutorRespaldo;
  publicadoPor: AutorRespaldo;
  /** ISO 8601. */
  editadoEn: string;
  /** ISO 8601. */
  publicadoEn: string;
}
