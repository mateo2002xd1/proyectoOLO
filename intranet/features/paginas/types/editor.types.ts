/**
 * Tipos locales para el editor visual (Puck + Editor.js).
 *
 * IMPORTANTE: Cuando @olo/types esté publicado (Fase 3), estos tipos
 * deben reemplazarse por los de '@olo/types'. No duplicar definiciones.
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §0.2 (@olo/types es la única fuente de tipos)
 * @see ARQUITECTURA_MAESTRA_OLO.md §3  (Flujo editorial — máquina de estados)
 * @see ARQUITECTURA_MAESTRA_OLO.md §10 (Modelo de datos — paginas_versiones.contenido JSONB)
 */

// ---------------------------------------------------------------------------
// Estados editoriales (§3 / §10)
// ---------------------------------------------------------------------------

export type EstadoPagina =
  | "borrador"
  | "en_revision"
  | "publicado"
  | "rechazado";

// ---------------------------------------------------------------------------
// Bloque de contenido (unidad mínima que guarda Puck en contenido JSONB)
// TODO: Fase 3 — reemplazar por import type { Bloque } from '@olo/types'
// ---------------------------------------------------------------------------

export interface BloqueEditorJs {
  /** Tipo de bloque de Editor.js: paragraph, header, list, image, etc. */
  type: string;
  data: Record<string, unknown>;
}

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

// ---------------------------------------------------------------------------
// Props de componentes del editor
// ---------------------------------------------------------------------------

export interface PuckEditorWrapperProps {
  slug: string;
  initialData: ContenidoPagina | null;
  /** Llamado con el JSON de Puck al hacer "Guardar borrador" */
  onGuardarBorrador: (contenido: ContenidoPagina) => Promise<void>;
  /** Llamado al hacer "Enviar a revisión" (sin payload — la versión ya fue guardada) */
  onEnviarRevision: () => Promise<void>;
  isSaving?: boolean;
  isSendingToReview?: boolean;
  versionActual?: PaginaVersion | null;
}

export interface EditorJsWrapperProps {
  /** Bloques iniciales de Editor.js (si ya hay contenido guardado) */
  initialBlocks?: BloqueEditorJs[];
  /** Callback que recibe el JSON serializado cuando el usuario para de escribir */
  onChange?: (blocks: BloqueEditorJs[]) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export interface EditButtonProps {
  slug: string;
  /** Si es false, el botón no se renderiza (permiso verificado server-side) */
  hasPermission: boolean;
}
