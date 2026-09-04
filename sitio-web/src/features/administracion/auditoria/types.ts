/** Contratos de la bitácora de cambios (RF-07). Espejo del DTO de la API. */

export type EntidadAuditable =
  | 'contenido'
  | 'pagina'
  | 'seccion'
  | 'usuario'
  | 'rol'
  | 'marca'
  | 'configuracion'
  | 'archivo';

export type AccionAuditable =
  | 'crear'
  | 'actualizar'
  | 'eliminar'
  | 'publicar'
  | 'despublicar'
  | 'aprobar'
  | 'rechazar'
  | 'enviar_revision'
  | 'guardar_borrador';

export interface CampoModificado {
  campo: string;
  /** Hoy siempre `null`: el backend todavía no guarda el estado anterior (T-07.6). */
  antes: unknown;
  despues: unknown;
}

export interface RegistroAuditoria {
  id: string;
  entidadId: string;
  entidadTipo: EntidadAuditable;
  usuarioId: string | null;
  usuarioNombre: string | null;
  accion: AccionAuditable;
  camposModificados: CampoModificado[];
  ip: string | null;
  userAgent: string | null;
  /** ISO 8601. */
  fecha: string;
}

export interface FiltrosAuditoria {
  usuarioId: string;
  accion: string;
  entidadTipo: string;
  /** `YYYY-MM-DD`; el backend interpreta `hasta` como el día completo. */
  desde: string;
  hasta: string;
}

export interface RespuestaAuditoria {
  registros: RegistroAuditoria[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

export const FILTROS_VACIOS: FiltrosAuditoria = {
  usuarioId: '',
  accion: '',
  entidadTipo: '',
  desde: '',
  hasta: '',
};

/**
 * Sustantivos y no verbos conjugados: la misma etiqueta sirve en el desplegable
 * del filtro («Publicación») y en la tabla, sin necesitar dos listas.
 */
export const ETIQUETA_ACCION: Record<AccionAuditable, string> = {
  crear: 'Creación',
  actualizar: 'Actualización',
  eliminar: 'Eliminación',
  publicar: 'Publicación',
  despublicar: 'Despublicación',
  aprobar: 'Aprobación',
  rechazar: 'Rechazo',
  enviar_revision: 'Envío a revisión',
  guardar_borrador: 'Borrador',
};

export const ETIQUETA_ENTIDAD: Record<EntidadAuditable, string> = {
  contenido: 'Contenido',
  pagina: 'Página',
  seccion: 'Sección',
  usuario: 'Usuario',
  rol: 'Rol',
  marca: 'Marca',
  configuracion: 'Configuración',
  archivo: 'Archivo',
};

/** El color separa lo que publica o aprueba de lo que destruye o frena. */
export const COLOR_ACCION: Record<AccionAuditable, string> = {
  crear: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  actualizar: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  eliminar: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  publicar: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  despublicar: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
  aprobar: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  rechazar: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  enviar_revision: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
  guardar_borrador: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
};

export const etiquetaDeAccion = (accion: AccionAuditable) => ETIQUETA_ACCION[accion] ?? accion;
export const etiquetaDeEntidad = (entidad: EntidadAuditable) => ETIQUETA_ENTIDAD[entidad] ?? entidad;
