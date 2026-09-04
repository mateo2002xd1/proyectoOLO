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
  despublicar: 'Archivado',
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

export const ETIQUETA_CAMPO: Record<string, string> = {
  name: 'Nombre',
  apellidos: 'Apellidos',
  email: 'Correo',
  role_id: 'Rol',
  status: 'Estado de cuenta',
  expiration_date: 'Fecha de caducidad',
  slug: 'Slug',
  version: 'Versión',
  estado: 'Estado',
  motivo: 'Motivo',
  titulo: 'Título',
  ambito: 'Ámbito',
  permiso: 'Permiso',
  permiso_concedido_a_rol: 'Permiso concedido a rol',
  permiso_retirado_a_roles: 'Permiso retirado a roles',
  versiones_eliminadas: 'Versiones eliminadas',
  paginaEliminada: 'Página eliminada',
  password_hash: 'Contraseña',
  permiso_asignado: 'Permiso asignado',
  permiso_revocado: 'Permiso revocado',
  debe_configurar_preguntas: 'Debe configurar preguntas',
  debe_cambiar_password: 'Debe cambiar contraseña',
  intentos_fallidos: 'Intentos fallidos',
  intentos_fallidos_login: 'Intentos fallidos de login',
  bloqueado_hasta: 'Bloqueado hasta',
  creado_por: 'Creado por',
  description: 'Descripción',
  es_sistema: 'Es de sistema',
};

export const etiquetaDeCampo = (campo: string) => {
  if (ETIQUETA_CAMPO[campo]) return ETIQUETA_CAMPO[campo];
  const limpio = campo.replace(/_/g, ' ').trim();
  if (!limpio) return campo;
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
};
