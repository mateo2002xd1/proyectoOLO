// Domain Event - Contenido Rechazado
// Stub: Implementar según Fase 7

export interface ContenidoRechazadoEvent {
  paginaId: number;
  slug: string;
  rechazadoPor: number;
  motivo: string;
  fecha: Date;
}
