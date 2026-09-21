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
  | 'cambiar_password'
  // Seguridad y administración (migración 030 de la API).
  | 'autenticar'
  | 'expirar'
  | 'inactivar';

/**
 * Las tres categorías del filtro que reemplaza a «Entidad».
 *
 * «Entidad» ofrecía ocho opciones —`contenido`, `pagina`, `seccion`, `usuario`, `rol`,
 * `marca`, `configuracion`, `archivo`— y de ellas ninguna dice **qué se hizo** con
 * claridad: `seccion`, `marca` y `archivo` ni siquiera las escribe ningún código. Lo
 * que quien audita quiere saber es de qué mundo habla la fila:
 *
 * - `editorial` — lo que se hace **en el editor**: crear una página y editar una
 *   sección o una página.
 * - `administracion` — lo que decide quien revisa: rechazar, publicar, archivar.
 * - `seguridad` — quién entra y con qué cuenta: autenticarse, modificar, expirar,
 *   inactivar o eliminar cuentas, y cambiar contraseñas.
 *
 * La regla que reparte las filas vive en la API (`auditoria-categorias.ts`), no aquí:
 * es la que hace el filtro en SQL y la que rellena `RegistroAuditoria.categoria`. Esta
 * pantalla solo la lee, para no tener dos copias que un día discrepen.
 */
export type CategoriaAuditoria = 'editorial' | 'administracion' | 'seguridad';

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
  /** Calculada por la API con la misma regla del filtro; `null` si la fila no encaja en ninguna. */
  categoria: CategoriaAuditoria | null;
  camposModificados: CampoModificado[];
  /**
   * Lo que pasó, en una frase, ya redactada por la API; `null` si todavía no sabe
   * contar ese cambio y hay que caer en lo de siempre. Ver `lib/cambios.ts`.
   */
  resumen: string | null;
  ip: string | null;
  userAgent: string | null;
  /** ISO 8601. */
  fecha: string;
}

export interface FiltrosAuditoria {
  usuarioId: string;
  /**
   * El `value` de una `OpcionAccion`: uno o varios verbos de la base separados por
   * coma (`actualizar,guardar_borrador,enviar_revision`), porque una etiqueta de la
   * pantalla puede agrupar verbos. Viaja tal cual al querystring.
   */
  accion: string;
  categoria: '' | CategoriaAuditoria;
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
  categoria: '',
  desde: '',
  hasta: '',
};

/**
 * Sustantivos y no verbos conjugados: la misma etiqueta sirve en el desplegable
 * del filtro («Publicación») y en la tabla, sin necesitar dos listas.
 *
 * Es la etiqueta **por defecto** de cada verbo de la base. Varios verbos comparten
 * etiqueta a propósito —«Edición» son `guardar_borrador` y `enviar_revision`;
 * «Publicación», `aprobar` y `publicar`— porque quien audita no piensa en los pasos
 * internos del ciclo editorial sino en lo que ocurrió con la página. Y `actualizar`
 * cambia de nombre según la categoría de la fila: ver `etiquetaDeAccion`.
 */
export const ETIQUETA_ACCION: Record<AccionAuditable, string> = {
  crear: 'Creación',
  actualizar: 'Actualización',
  eliminar: 'Eliminación',
  publicar: 'Publicación',
  despublicar: 'Archivado',
  aprobar: 'Publicación',
  rechazar: 'Rechazo',
  enviar_revision: 'Edición',
  guardar_borrador: 'Edición',
  cambiar_password: 'Cambio de contraseña',
  autenticar: 'Autenticación',
  expirar: 'Expiró',
  inactivar: 'Inactivación',
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

export const ETIQUETA_CATEGORIA: Record<CategoriaAuditoria, string> = {
  editorial: 'Contenido editorial',
  administracion: 'Administración',
  seguridad: 'Seguridad',
};

/**
 * Cómo se nombra una acción cuando se sabe a qué categoría pertenece la fila.
 *
 * `actualizar` es el mismo verbo en la base para dos cosas que a quien audita le
 * importan por separado: editar una página o un contenido es «Edición» —el mismo nombre
 * que guardar un borrador—, y cambiar un usuario o un rol (su rol, sus permisos, sus
 * datos) es «Modificación». Con solo el verbo no se puede distinguir; con la categoría
 * sí, y es la misma que usa el filtro, así que la píldora de una fila y lo que trae el
 * filtro «Edición» nunca discrepan: hay 165 filas de `pagina` con `actualizar` de antes
 * de que existiera `guardar_borrador`, y el filtro las cuenta como ediciones. Sin
 * categoría queda «Actualización».
 */
export const etiquetaDeAccion = (accion: AccionAuditable, categoria?: CategoriaAuditoria | null) => {
  if (accion === 'actualizar') {
    if (categoria === 'editorial') return 'Edición';
    if (categoria === 'seguridad') return 'Modificación';
  }
  return ETIQUETA_ACCION[accion] ?? accion;
};

/**
 * Severidad de cada acción, con los nombres de los cuatro niveles de un sistema de
 * diseño: `brand` (rutina), `success` (logro), `warning` (atención) y `danger`
 * (crítico). `dangerFuerte` es el mismo `danger` en su nivel más alto.
 *
 * Antes cada acción tenía su propio color —nueve tonos, sin más orden que ser
 * distintos—. Ahora el color dice **qué tan grave es o qué tan atento hay que estar**,
 * y son cuatro tonos que se aprenden de una vez:
 *
 * - `brand` — **Rutina.** Actividad normal del sistema, sin nada que mirar: crear,
 *   editar, modificar, autenticarse, archivar, cambiar contraseña. Verde de marca.
 * - `success` — **Logro.** Algo llegó a buen puerto y ya lo ve el público: publicar.
 * - `warning` — **Atención.** Nada se perdió, pero alguien tiene que hacer algo:
 *   corregir un rechazo o reactivar una cuenta que caducó.
 * - `danger` — **Crítico.** Se pierde algo o se cierra un acceso. `dangerFuerte` es la
 *   eliminación, que no se deshace y por eso es lo único en relleno sólido;
 *   `danger` a secas es inactivar una cuenta, que se puede revertir.
 *
 * El color **no es el único indicador**: la píldora siempre lleva su etiqueta al lado,
 * así que quien no distinga los tonos lee igual la acción. Es lo que exige
 * `9-accesibilidad.md`. Contrastes medidos con la paleta de Tailwind v4 y, en oscuro,
 * con el fondo translúcido compuesto sobre el del panel (`#131b2f`); texto contra
 * fondo, claro / oscuro: `success` 6.5 / 11.5, `warning` 8.1 / 11.4 —el ámbar mantiene
 * su `900` en el texto, que en `800` se queda corto—, `danger` 6.9 / 10.4,
 * `dangerFuerte` 6.4, y `brand` 7.0 / 6.3. AA pide 4.5.
 */
export type VarianteBadge = 'brand' | 'success' | 'warning' | 'danger' | 'dangerFuerte';

export const CLASES_BADGE: Record<VarianteBadge, string> = {
  // El verde de marca (`--color-brand-interactive`, #7DB828) es de tono medio: como
  // texto no llega a AA sobre su propio fondo, así que el texto va con sombras más
  // oscuras (claro) o más claras (oscuro), las mismas familias del enlace «Ver más».
  brand: 'bg-[#7DB828]/20 text-[#365812] dark:bg-[#7DB828]/25 dark:text-[#9ED65C]',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  warning: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  dangerFuerte: 'bg-red-700 text-white',
};

export const VARIANTE_ACCION: Record<AccionAuditable, VarianteBadge> = {
  crear: 'brand',
  actualizar: 'brand',
  guardar_borrador: 'brand',
  enviar_revision: 'brand',
  despublicar: 'brand',
  cambiar_password: 'brand',
  autenticar: 'brand',
  publicar: 'success',
  aprobar: 'success',
  rechazar: 'warning',
  expirar: 'warning',
  inactivar: 'danger',
  eliminar: 'dangerFuerte',
};

/** Las clases de la píldora de cada acción, ya resueltas a partir de su severidad. */
export const COLOR_ACCION: Record<AccionAuditable, string> = Object.fromEntries(
  (Object.keys(VARIANTE_ACCION) as AccionAuditable[]).map((accion) => [
    accion,
    CLASES_BADGE[VARIANTE_ACCION[accion]],
  ]),
) as Record<AccionAuditable, string>;

/**
 * Una entrada del desplegable «Acción».
 *
 * `value` puede llevar varios verbos de la base separados por coma, porque una etiqueta
 * agrupa: «Edición» es `actualizar`, `guardar_borrador` y `enviar_revision`. Cada acción
 * pertenece a **una sola** categoría: elegirla fija también la categoría, y con una
 * categoría elegida el desplegable oculta las de las otras dos.
 *
 * Por qué la acción viaja siempre con su categoría: «Edición» y «Modificación» incluyen
 * las dos el verbo `actualizar`, y solo la categoría dice si se habla de una página o de
 * una cuenta. La API las combina con «y».
 */
export interface OpcionAccion {
  value: string;
  label: string;
  categoria: CategoriaAuditoria;
}

export const OPCIONES_ACCION: OpcionAccion[] = [
  { value: 'crear', label: 'Creación', categoria: 'editorial' },
  { value: 'actualizar,guardar_borrador,enviar_revision', label: 'Edición', categoria: 'editorial' },
  { value: 'rechazar', label: 'Rechazo', categoria: 'administracion' },
  { value: 'aprobar,publicar', label: 'Publicación', categoria: 'administracion' },
  { value: 'despublicar', label: 'Archivado', categoria: 'administracion' },
  { value: 'autenticar', label: 'Autenticación', categoria: 'seguridad' },
  { value: 'actualizar', label: 'Modificación', categoria: 'seguridad' },
  { value: 'expirar', label: 'Expiró', categoria: 'seguridad' },
  { value: 'inactivar', label: 'Inactivación', categoria: 'seguridad' },
  { value: 'cambiar_password', label: 'Cambio de contraseña', categoria: 'seguridad' },
  { value: 'eliminar', label: 'Eliminación', categoria: 'seguridad' },
];

/** Las acciones que caben con la categoría elegida (o todas, si no hay ninguna). */
export const opcionesDeAccion = (categoria: '' | CategoriaAuditoria): OpcionAccion[] =>
  OPCIONES_ACCION.filter((opcion) => !categoria || opcion.categoria === categoria);

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
  comentario: 'Comentario de cambios',
  titulo: 'Título',
  ambito: 'Ámbito',
  permiso: 'Permiso',
  permiso_concedido_a_rol: 'Permiso concedido a rol',
  permiso_retirado_a_roles: 'Permiso retirado a roles',
  versiones_eliminadas: 'Versiones eliminadas',
  paginas_afectadas: 'Páginas afectadas',
  espacio_liberado: 'Espacio liberado',
  peso_tabla: 'Peso de la tabla',
  fecha_corte: 'Fecha de corte',
  respaldo_protegido: 'Respaldo protegido',
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
