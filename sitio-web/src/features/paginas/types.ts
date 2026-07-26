export type EstadoPagina = 'borrador' | 'en_revision' | 'publicado' | 'rechazado';

/** Props de un bloque: vienen del CMS, así que su forma la valida cada bloque. */
export type BloqueProps = Record<string, unknown>;

export interface Bloque {
  type: string;
  props: BloqueProps;
}

export interface PuckData {
  content: Bloque[];
  root: BloqueProps;
  zones?: Record<string, Bloque[]>;
}

export interface Pagina {
  id: string;
  slug: string;
  titulo: string;
  contenido: PuckData | Bloque[];
  layout?: unknown;
  versionPublicadaId?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface PaginaVersion {
  id: string;
  paginaId: string;
  contenido: PuckData | Bloque[];
  layout?: unknown;
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
