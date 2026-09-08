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
  | 'guardar_borrador'
  | 'cambiar_password';

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
  aprobar: 'Publicación',
  rechazar: 'Rechazo',
  enviar_revision: 'Envío a revisión',
  guardar_borrador: 'Borrador',
  cambiar_password: 'Cambio de contraseña',
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

/**
 * Un color propio por acción — las nueve, sin repetir.
 *
 * Antes había nueve acciones y solo cinco colores: `publicar`/`aprobar` compartían el
 * verde, `eliminar`/`rechazar` el rojo, `despublicar`/`enviar_revision` el ámbar y
 * `actualizar`/`guardar_borrador` el gris. En una tabla que se lee por barrido, dos
 * filas del mismo color se toman por la misma cosa, y justamente esos pares son los que
 * conviene no confundir: aprobar no es publicar, y rechazar no es eliminar.
 *
 * El tono se elige por familias, para que el color siga significando algo y no sea un
 * repartir colores al azar:
 *
 * - **Rojos — frenan o destruyen.** `eliminar` en rojo pleno (es irreversible);
 *   `rechazar` en rosa, que frena el flujo pero no borra nada.
 * - **Verdes — dan luz verde.** `publicar` en verde (queda a la vista del público);
 *   `aprobar` en esmeralda, el paso previo que aún no es la publicación.
 * - **Ámbar — espera.** `enviar_revision`: algo quedó pendiente de otra persona.
 * - **Neutros y fríos — sin carga.** `actualizar` en gris por ser la más frecuente (la
 *   que más se repite debe ser la que menos grita); `despublicar` en verde azulado, que
 *   es retirar a archivo, no un error; `guardar_borrador` en violeta, trabajo en curso;
 *   `crear` en azul.
 *
 * El color **no es el único indicador**: la píldora siempre lleva su `ETIQUETA_ACCION`
 * al lado, así que quien no distinga los tonos lee igual la acción. Es lo que exige
 * `9-accesibilidad.md`, y por eso se conservan los mismos pares de intensidad
 * (`100/800` en claro, `900/200` en oscuro) ya validados para contraste AA — el ámbar
 * mantiene su `900` en el texto, que en `800` se queda corto sobre fondo claro.
 */
export const COLOR_ACCION: Record<AccionAuditable, string> = {
  crear: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  actualizar: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  eliminar: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  publicar: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  despublicar: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
  aprobar: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  rechazar: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  enviar_revision: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
  guardar_borrador: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  cambiar_password: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200',
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
