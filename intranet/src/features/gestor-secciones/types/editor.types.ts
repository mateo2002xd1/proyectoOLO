/**
 * Tipos locales para el editor visual (Puck + Editor.js).
 *
 * IMPORTANTE: Cuando @olo/types esté publicado (Fase 3), estos tipos
 * deben reemplazarse por los de '@olo/types'. No duplicar definiciones.
 *
 * @see 1-guia-del-proyecto.md §4.4 (@olo/types es la única fuente de tipos)
 * @see 8-ciclo-editorial.md §1  (Flujo editorial — máquina de estados)
 * @see 1-guia-del-proyecto.md §2 (Modelo de datos — paginas_versiones.contenido JSONB)
 */

import type { ContextoDeEdicion } from "@/config/puck.config";

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
  /**
   * El resto de la sección, para pintarlo inerte alrededor de lo editable.
   * Lo resuelve el Server Component del editor; ver `configDeEdicion`.
   */
  contexto?: ContextoDeEdicion;
  /**
   * Nombre de quien nos quitó el candado de edición mientras trabajábamos.
   *
   * Con esto puesto el editor sigue en pantalla —para poder copiar lo que se llevara
   * hecho— pero no deja guardar: quien tiene ahora la sección no debe recibir un
   * borrador nuestro encima del suyo.
   */
  candadoPerdidoPor?: string | null;
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
