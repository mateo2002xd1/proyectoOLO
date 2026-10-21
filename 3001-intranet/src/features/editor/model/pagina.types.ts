/**
 * El vocabulario del módulo: la forma de una página, de su contenido y de sus
 * versiones, tal como la devuelve la API. Lo comparten todas las etapas.
 *
 * Solo tipos de datos. Las props de cada componente viven en el propio componente,
 * porque `model/` no importa de ninguna etapa (`8-ciclo-editorial.md` §3.2, regla 1).
 *
 * IMPORTANTE: Cuando @olo/types esté publicado (Fase 3), estos tipos
 * deben reemplazarse por los de '@olo/types'. No duplicar definiciones.
 *
 * @see 1-guia-del-proyecto.md §4.4 (@olo/types es la única fuente de tipos)
 * @see 8-ciclo-editorial.md §1  (Flujo editorial — máquina de estados)
 * @see 1-guia-del-proyecto.md §2 (Modelo de datos — paginas_versiones.contenido JSONB)
 */

// ---------------------------------------------------------------------------
// Estados editoriales (§3 / §10)
// ---------------------------------------------------------------------------

// 'archivado' es la versión que estuvo publicada y fue reemplazada por otra:
// no es borrador ni rechazada. Ver 11-base-de-datos.md §5, invariante I1.
export type EstadoPagina =
  | "borrador"
  | "en_revision"
  | "publicado"
  | "rechazado"
  | "archivado";

// ---------------------------------------------------------------------------
// Bloque de contenido (unidad mínima que guarda Puck en contenido JSONB)
// TODO: Fase 3 — reemplazar por import type { Bloque } from '@olo/types'
// ---------------------------------------------------------------------------

export interface BloquePuck {
  /** Tipo de bloque definido en puckConfig (RichText, Hero, ImagenDestacada…) */
  type: string;
  props: Record<string, unknown>;
}

/** Estructura completa que se guarda en paginas_versiones.contenido (JSONB) */
export interface ContenidoPagina {
  /** Bloques y layout gestionados por Puck */
  content: BloquePuck[];
  root?: Record<string, unknown>;
  zones?: Record<string, BloquePuck[]>;
}

// ---------------------------------------------------------------------------
// Versión de página (paginas_versiones, §10)
// ---------------------------------------------------------------------------

export interface PaginaVersion {
  id: string;
  paginaId: string;
  slug: string;
  titulo: string;
  contenido: ContenidoPagina;
  estado: EstadoPagina;
  motivoRechazo?: string | null;
  numeroVersion: number;
  creadoEn: string;
}

/** Lo que devuelve la API de una página publicada. */
export interface PaginaPublicada {
  slug: string;
  titulo: string;
  contenido: ContenidoPagina;
}

/** La última versión de una página, en el estado que esté, para abrirla en el editor. */
export interface VersionEditable {
  paginaId?: string;
  slug: string;
  titulo: string;
  contenido: ContenidoPagina;
  estado: EstadoPagina | null;
  versionId: string | null;
  numeroVersion: number | null;
  /** Por qué volvió a borrador. Solo trae algo cuando `estado === "rechazado"`. */
  motivoRechazo: string | null;
}

// ---------------------------------------------------------------------------
// Índice de búsqueda (lo lee el buscador de la barra de navegación)
// ---------------------------------------------------------------------------

export interface ItemTextoBusqueda {
  type: 'h1' | 'h2' | 'p' | 'span';
  text: string;
  blockId?: string;
}

export interface PaginaIndiceBusqueda {
  href: string;
  slug: string;
  titulo: string;
  items: ItemTextoBusqueda[];
}
