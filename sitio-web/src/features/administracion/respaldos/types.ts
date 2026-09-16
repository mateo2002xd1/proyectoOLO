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

/**
 * Candado de edición vigente sobre una página, tal como lo devuelve
 * `GET /api/paginas/{slug}/bloqueo`.
 *
 * Campos en `snake_case` porque el backend sirve la fila de `bloqueos_edicion` tal
 * cual (ver `FilaBloqueo` en `bloqueo-edicion.repository.ts`); las fechas llegan como
 * texto ISO, no como `Date`, por pasar por JSON.
 */
export interface BloqueoVigente {
  ambito: string;
  slug: string;
  usuario_id: string;
  usuario_nombre: string;
  adquirido_en: string;
  expira_en: string;
}

export interface RegistroRespaldo {
  id: string;
  paginaId: string;
  titulo: string;
  slug: string;
  ambito?: 'sitio' | 'intranet';
  numeroVersion: number;
  /** Número de la versión anterior archivada disponible para restaurar. */
  versionAnteriorNumero: number | null;
  versionAnteriorId?: string | null;
  editadoPor: AutorRespaldo;
  publicadoPor: AutorRespaldo;
  /** ISO 8601. */
  editadoEn: string;
  /** ISO 8601. */
  publicadoEn: string;
}

export interface FiltrosDepuracion {
  ambito?: 'sitio' | 'intranet';
  paginaId?: string;
  fechaCorte: string; // ISO YYYY-MM-DD
  conservarUltimoRespaldo?: boolean;
}

export interface DetallePaginaDepuracion {
  paginaId: string;
  slug: string;
  titulo: string;
  ambito: 'sitio' | 'intranet';
  cantidadVersiones: number;
  bytesEstimados: number;
}

export interface AnalisisDepuracionDTO {
  totalVersiones: number;
  totalPaginas: number;
  bytesEstimados: number;
  fechaCorteLimite: string;
  limiteMaximo?: number;
  paginasAfectadas: DetallePaginaDepuracion[];
}

export interface ResultadoDepuracionDTO {
  eliminadas: number;
  paginasAfectadas: number;
  bytesLiberados: number;
}
