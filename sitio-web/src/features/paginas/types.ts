export type EstadoPagina = 'borrador' | 'en_revision' | 'publicado' | 'rechazado';

export interface Bloque {
  type: string;
  props: Record<string, any>;
}

export interface PuckData {
  content: Bloque[];
  root: Record<string, any>;
  zones?: Record<string, Bloque[]>;
}

export interface Pagina {
  id: string;
  slug: string;
  titulo: string;
  contenido: PuckData | Bloque[];
  layout?: any;
  versionPublicadaId?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface PaginaVersion {
  id: string;
  paginaId: string;
  contenido: PuckData | Bloque[];
  layout?: any;
  numeroVersion: number;
  estado: EstadoPagina;
  motivoRechazo?: string;
  creadoEn: string;
}

export interface PaginaEnRevision {
  id: string;
  paginaId: string;
  titulo: string;
  slug: string;
  numeroVersion: number;
  creadoEn: string;
  autor?: {
    id: string;
    nombre: string;
    email: string;
  };
}
