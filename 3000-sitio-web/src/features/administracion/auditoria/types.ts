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
  | 'inactivar'
  // Migración 031 de la API.
  | 'bloquear'
  | 'verificar_preguntas'
  // Migración 040 de la API: el guardado que hace el editor solo.
  | 'autoguardar_borrador';

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
 * Participios desde el 2026-10-15 («Publicado», «Editado»; antes sustantivos como
 * «Publicación»): la misma etiqueta sirve en el desplegable del filtro y en la tabla,
 * sin necesitar dos listas.
 *
 * Es la etiqueta **por defecto** de cada verbo de la base. Varios verbos comparten
 * etiqueta a propósito —«Editado» son `guardar_borrador` y `enviar_revision`;
 * «Publicado», `aprobar` y `publicar`— porque quien audita no piensa en los pasos
 * internos del ciclo editorial sino en lo que ocurrió con la página. Y `actualizar`
 * cambia de nombre según la categoría de la fila: ver `etiquetaDeAccion`.
 */
export const ETIQUETA_ACCION: Record<AccionAuditable, string> = {
  crear: 'Creado',
  actualizar: 'Modificado',
  eliminar: 'Eliminado',
  publicar: 'Publicado',
  despublicar: 'Archivado',
  aprobar: 'Publicado',
  rechazar: 'Rechazado',
  enviar_revision: 'Editado',
  guardar_borrador: 'Editado',
  autoguardar_borrador: 'Autoguardado',
  cambiar_password: 'Actualizado',
  autenticar: 'Autenticado',
  expirar: 'Expirado',
  inactivar: 'Inactivado',
  bloquear: 'Bloqueado',
  verificar_preguntas: 'Verificado',
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
 * importan por separado: editar una página o un contenido es «Editado» —el mismo nombre
 * que guardar un borrador—, y cambiar un usuario o un rol (su rol, sus permisos, sus
 * datos) es «Modificado». Con solo el verbo no se puede distinguir; con la categoría
 * sí, y es la misma que usa el filtro, así que la píldora de una fila y lo que trae el
 * filtro «Editado» nunca discrepan: hay 165 filas de `pagina` con `actualizar` de antes
 * de que existiera `guardar_borrador`, y el filtro las cuenta como ediciones. Sin
 * categoría queda «Modificado»: «Actualizado» es el cambio de contraseña.
 */
export const etiquetaDeAccion = (accion: AccionAuditable, categoria?: CategoriaAuditoria | null) => {
  if (accion === 'actualizar') {
    if (categoria === 'editorial') return 'Editado';
    if (categoria === 'seguridad') return 'Modificado';
  }
  return ETIQUETA_ACCION[accion] ?? accion;
};

/**
 * El color de cada etiqueta de acción, fondo y letra, como los eligió el usuario
 * (2026-10-15). Va por **etiqueta** y no por verbo: `actualizar` es «Editado» o
 * «Modificado» según la categoría, y cada una lleva su color. Lo resuelve
 * `colorDeAccion`, que usan la píldora de la tabla, la frase del acordeón y el detalle.
 *
 * Reemplaza los cuatro niveles de severidad de antes (rutina, logro, atención,
 * crítico). Los colores son fijos, los mismos en tema claro y oscuro: con relleno
 * sólido se leen igual sobre los dos fondos. El color no es el único indicador: la
 * píldora siempre lleva su nombre (`9-accesibilidad.md`).
 */
export const COLOR_DE_ETIQUETA: Record<string, string> = {
  Creado: 'bg-[#39A900] text-white',
  Editado: 'bg-[#001631] text-white',
  Autoguardado: 'bg-[#1FACE3] text-white',
  Rechazado: 'bg-[#FFE9E9] text-[#FF1F1F]',
  Publicado: 'bg-[#7DB728] text-white',
  Archivado: 'bg-[#FDC300] text-white',
  Autenticado: 'bg-[#007832] text-white',
  Modificado: 'bg-[#71277A] text-white',
  Expirado: 'bg-[#FEECB0] text-[#8F6E00]',
  Inactivado: 'bg-[#BFBFBF] text-[#303030]',
  Bloqueado: 'bg-[#FF6969] text-white',
  Verificado: 'bg-[#3F1E6B] text-white',
  Actualizado: 'bg-[#00304D] text-white',
  Eliminado: 'bg-[#E81C1C] text-white',
};

/** Las clases de la píldora de una acción, a partir de la etiqueta que lleva en esa fila. */
export const colorDeAccion = (accion: AccionAuditable, categoria?: CategoriaAuditoria | null) =>
  COLOR_DE_ETIQUETA[etiquetaDeAccion(accion, categoria)] ?? 'bg-zinc-200 text-zinc-800';

/**
 * Una entrada del desplegable «Acción».
 *
 * `value` puede llevar varios verbos de la base separados por coma, porque una etiqueta
 * agrupa: «Editado» es `actualizar`, `guardar_borrador` y `enviar_revision`. Cada acción
 * pertenece a **una sola** categoría: elegirla fija también la categoría, y con una
 * categoría elegida el desplegable oculta las de las otras dos.
 *
 * Por qué la acción viaja siempre con su categoría: «Editado» y «Modificado» incluyen
 * las dos el verbo `actualizar`, y solo la categoría dice si se habla de una página o de
 * una cuenta. La API las combina con «y».
 */
export interface OpcionAccion {
  value: string;
  label: string;
  categoria: CategoriaAuditoria;
}

export const OPCIONES_ACCION: OpcionAccion[] = [
  { value: 'crear', label: 'Creado', categoria: 'editorial' },
  { value: 'actualizar,guardar_borrador,enviar_revision', label: 'Editado', categoria: 'editorial' },
  // Aparte de «Editado» a propósito: se escribe solo cada 30 s mientras alguien edita, y
  // dentro de «Editado» taparía los guardados y envíos que sí decidió una persona.
  { value: 'autoguardar_borrador', label: 'Autoguardado', categoria: 'editorial' },
  { value: 'rechazar', label: 'Rechazado', categoria: 'administracion' },
  { value: 'aprobar,publicar', label: 'Publicado', categoria: 'administracion' },
  { value: 'despublicar', label: 'Archivado', categoria: 'administracion' },
  { value: 'autenticar', label: 'Autenticado', categoria: 'seguridad' },
  { value: 'actualizar', label: 'Modificado', categoria: 'seguridad' },
  { value: 'expirar', label: 'Expirado', categoria: 'seguridad' },
  { value: 'inactivar', label: 'Inactivado', categoria: 'seguridad' },
  { value: 'bloquear', label: 'Bloqueado', categoria: 'seguridad' },
  { value: 'verificar_preguntas', label: 'Verificado', categoria: 'seguridad' },
  { value: 'cambiar_password', label: 'Actualizado', categoria: 'seguridad' },
  { value: 'eliminar', label: 'Eliminado', categoria: 'seguridad' },
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
  origen: 'Portal',
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
  // Configuración → Identidad visual del panel (`identidad-panel.usecase.ts`).
  logo_del_panel: 'Logo del panel',
  icono_del_panel: 'Icono del panel',
  blanco_en_modo_oscuro: 'Logo e icono en blanco en modo oscuro',
  colores_de_acciones: 'Colores de las etiquetas de acción',
  colores_de_botones: 'Colores de los botones',
};

export const etiquetaDeCampo = (campo: string) => {
  if (ETIQUETA_CAMPO[campo]) return ETIQUETA_CAMPO[campo];
  const limpio = campo.replace(/_/g, ' ').trim();
  if (!limpio) return campo;
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
};
