/**
 * Qué se puede encontrar desde el buscador del panel.
 *
 * Es una lista escrita a mano y no un recorrido automático de `app/admin/`: las
 * rutas de Next no llevan título ni sinónimos, y lo que hace útil a un buscador es
 * justo eso —que «bitácora» lleve a Auditoría y «contraseña» a Mi perfil—. Añadir
 * un destino es añadir una entrada aquí.
 *
 * **Solo se indexan rutas que existen.** El menú lateral enlaza además a
 * `/admin/dashboard/configuracion` y `/admin/dashboard/soporte`, que hoy no tienen
 * página; ofrecerlas aquí sería mandar a un 404 desde un resultado de búsqueda.
 */

export interface DestinoPanel {
  /** Identificador estable: sirve de `key` y de `id` para `aria-activedescendant`. */
  id: string;
  titulo: string;
  descripcion: string;
  href: string;
  /** Sección bajo la que se agrupa en la lista de resultados. */
  grupo: string;
  /**
   * Palabras por las que también debe encontrarse, además del título y la
   * descripción. Aquí van los sinónimos y el vocabulario que usa la gente aunque no
   * aparezca escrito en la interfaz («bitácora», «habeas data», «cola»).
   */
  sinonimos: string[];
}

const URL_INTRANET = process.env.NEXT_PUBLIC_INTRANET_URL || 'http://localhost:3001';

export const DESTINOS_PANEL: DestinoPanel[] = [
  {
    id: 'dashboard',
    titulo: 'Dashboard',
    descripcion: 'Resumen general: actividad reciente, usuarios por rol y páginas pendientes.',
    href: '/admin/dashboard',
    grupo: 'Panel',
    sinonimos: ['inicio', 'panel general', 'resumen', 'metricas', 'estadisticas', 'home'],
  },
  {
    id: 'usuarios',
    titulo: 'Usuarios',
    descripcion: 'Altas, roles y estado de las cuentas del panel.',
    href: '/admin/users',
    grupo: 'Gestión',
    sinonimos: [
      'cuentas',
      'roles',
      'permisos',
      'administrador',
      'editor',
      'superadmin',
      'personas',
      'crear usuario',
    ],
  },
  {
    id: 'revision',
    titulo: 'Páginas en revisión',
    descripcion: 'Cola editorial: aprobar o rechazar los cambios enviados a revisión.',
    href: '/admin/revision',
    grupo: 'Gestión',
    sinonimos: ['aprobar', 'rechazar', 'cola', 'publicar', 'borradores', 'pendientes', 'editorial'],
  },
  {
    id: 'auditoria',
    titulo: 'Auditoría',
    descripcion: 'Registro de quién hizo qué y cuándo, con exportación a CSV.',
    href: '/admin/auditoria',
    grupo: 'Gestión',
    sinonimos: ['bitacora', 'historial', 'registros', 'trazabilidad', 'log', 'csv', 'seguimiento'],
  },
  {
    id: 'respaldos',
    titulo: 'Respaldos',
    descripcion: 'Historial de versiones, copias de seguridad y restauración de páginas.',
    href: '/admin/respaldos',
    grupo: 'Gestión',
    sinonimos: [
      'backup',
      'backups',
      'restaurar',
      'restauracion',
      'versiones',
      'recuperar',
      'copias de seguridad',
      'historial de versiones',
      'rollback',
      'version anterior',
    ],
  },
  {
    id: 'plantilla',
    titulo: 'Menú y pie de página',
    descripcion: 'Configurar la cabecera y el pie que comparten todas las páginas del sitio.',
    href: '/admin/editor/menu-y-pie',
    grupo: 'Contenido',
    sinonimos: ['plantilla', 'cabecera', 'header', 'footer', 'navegacion', 'menu', 'enlaces'],
  },
  {
    id: 'sitio-inicio',
    titulo: 'Ver Sitio Web',
    descripcion: 'Página de inicio pública del Observatorio Laboral y Ocupacional.',
    href: '/inicio',
    grupo: 'Sitio Público',
    sinonimos: ['portal', 'portal web', 'ver sitio', 'sitio publico', 'frontend', 'portada'],
  },
  {
    id: 'sitio-publicaciones',
    titulo: 'Publicaciones y Estudios',
    descripcion: 'Repositorio de boletines, catálogos e informes del observatorio.',
    href: '/publicaciones',
    grupo: 'Sitio Público',
    sinonimos: ['boletines', 'informes', 'documentos', 'estudios', 'pdf', 'descargas'],
  },
  {
    id: 'sitio-clasificacion',
    titulo: 'Clasificación de Ocupaciones',
    descripcion: 'Consulta interactiva de clasificaciones ocupacionales CUOC y CNO.',
    href: '/clasificacion',
    grupo: 'Sitio Público',
    sinonimos: ['cuoc', 'cno', 'ocupaciones', 'empleos', 'perfiles', 'clasificaciones'],
  },
  {
    id: 'intranet-portal',
    titulo: 'Portal Intranet',
    descripcion: 'Acceso a la intranet institucional: Tasa, Matriz de Pertinencia y Encuestas.',
    href: `${URL_INTRANET}/inicio`,
    grupo: 'Intranet',
    sinonimos: [
      'intranet',
      'portal intranet',
      'acceso intranet',
      'institucional',
    ],
  },
  {
    id: 'intranet-tasa',
    titulo: 'Tasa de Vinculación y Empleabilidad',
    descripcion: 'Indicadores y métricas de empleabilidad de egresados SENA.',
    href: `${URL_INTRANET}/tasa`,
    grupo: 'Intranet',
    sinonimos: ['tasa', 'vinculacion', 'empleabilidad', 'egresados', 'metricas', 'indicadores'],
  },
  {
    id: 'intranet-matriz',
    titulo: 'Matriz de Pertinencia',
    descripcion: 'Herramienta estratégica de pertinencia de programas SENA.',
    href: `${URL_INTRANET}/matriz`,
    grupo: 'Intranet',
    sinonimos: ['matriz', 'pertinencia', 'programas', 'demanda social', 'ocupaciones'],
  },
  {
    id: 'intranet-encuestas',
    titulo: 'Encuestas Intranet',
    descripcion: 'Encuestas de Calidad de Formación y Seguimiento Laboral.',
    href: `${URL_INTRANET}/encuestas/calidad-de-formacion`,
    grupo: 'Intranet',
    sinonimos: ['encuestas', 'calidad de formacion', 'seguimiento laboral', 'empresarios'],
  },
  {
    id: 'mi-perfil',
    titulo: 'Mi perfil',
    descripcion: 'Tus datos de cuenta y el cambio de contraseña.',
    href: '/admin/mi-perfil',
    grupo: 'Cuenta',
    sinonimos: ['contrasena', 'clave', 'password', 'mis datos', 'correo', 'cuenta'],
  },
];

/**
 * Forma comparable de un texto: sin tildes, sin mayúsculas y sin espacios sobrantes.
 *
 * Sin quitar las tildes, escribir «auditoria» no encontraría «Auditoría», que es
 * exactamente lo que teclea cualquiera que no se pare a poner el acento. Se
 * descompone en NFD para separar la letra de su tilde y se borra el rango de
 * diacríticos combinantes.
 */
export const normalizar = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** Texto sobre el que se busca cada destino, calculado una sola vez. */
const INDICE = DESTINOS_PANEL.map((destino) => ({
  destino,
  texto: normalizar(
    [destino.titulo, destino.descripcion, destino.grupo, ...destino.sinonimos].join(' ')
  ),
}));

/**
 * Destinos que coinciden con lo tecleado.
 *
 * Exige que **todas** las palabras aparezcan, no una cualquiera: quien escribe
 * «pagina revision» está estrechando la búsqueda, y con un `some` obtendría más
 * resultados cuantas más palabras teclea, que es justo lo contrario de lo que
 * espera. No se ordena por relevancia a propósito —son siete destinos y el orden
 * fijo por grupo se aprende de memoria—; si la lista crece, aquí es donde toca.
 *
 * Con la consulta vacía devuelve todo, para que el modal abra mostrando el mapa
 * completo del panel en vez de un hueco en blanco.
 */
export const buscarEnPanel = (consulta: string): DestinoPanel[] => {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return DESTINOS_PANEL;

  return INDICE.filter(({ texto }) => palabras.every((palabra) => texto.includes(palabra))).map(
    ({ destino }) => destino
  );
};
