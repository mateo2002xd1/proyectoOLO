/** Contratos públicos de "Alertas de inversión" (`GET /api/alertas-inversion/*`). */

export interface SeccionConCantidad {
  letra: string;
  nombre: string;
  cantidadProyectos: number;
}

export interface ProyectoInversionPublico {
  id: string;
  tipo: string;
  descripcion: string;
  empresa: string;
  sector: string;
  codigoCiiu: string | null;
  actividad: string | null;
  ubicaciones: string;
  fechaAnuncio: string;
  fuenteUrl: string;
  fuenteMedio: string | null;
  inversionCop: number | null;
  empleosEstimados: number | null;
}

export interface ListadoPublico {
  proyectos: ProyectoInversionPublico[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

export interface OpcionesAlertasInversion {
  secciones: { id: string; letra: string; nombre: string }[];
  anios: number[];
}

export interface FiltrosAlertasInversion {
  /** Letra de sección CIIU (A–U); vacío = todas. */
  seccion: string;
  /** Vacío = todos los años. */
  anio: string;
}
