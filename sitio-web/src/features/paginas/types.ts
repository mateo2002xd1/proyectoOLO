// 'archivado' es la versión que estuvo publicada y fue reemplazada por otra:
// no es borrador ni rechazada. Ver 11-base-de-datos.md §5, invariante I1.
export type EstadoPagina = 'borrador' | 'en_revision' | 'publicado' | 'rechazado' | 'archivado';

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

/** A qué aplicación pertenece una página: el mismo slug existe en las dos. */
export type Ambito = 'sitio' | 'intranet';

export interface PaginaEnRevision {
  id: string;
  paginaId: string;
  titulo: string;
  slug: string;
  /** Sin esto no se sabe cuál de las dos páginas homónimas se aprueba. */
  ambito: Ambito;
  numeroVersion: number;
  creadoEn: string;
  autor?: {
    id: string;
    nombre: string;
    email: string;
  };
}
