/**
 * Catálogo de permisos del OLO — la lista de lo que se puede conceder.
 *
 * Vive en la API y no en un frontend porque es **la API quien los comprueba**. El panel
 * los pinta, pero quien decide si una petición pasa es `requirePermission`, y una lista
 * de permisos que el servidor no conoce no serviría para negar nada.
 *
 * ## Por qué se rehízo
 *
 * El catálogo anterior tenía 21 claves y **ninguna ruta comprobaba ninguna**. Toda la
 * autorización iba por rol, así que el panel dejaba mover interruptores que no hacían
 * nada: se podía «revocar» Eliminar Usuarios y esa persona seguía borrando. Tampoco se
 * mantenía solo — `sembrar-permisos-roles.ts` declaraba que el Editor no tenía
 * `access_dashboard` y en la base lo tenía, porque nada lo verificaba.
 *
 * Además había claves indistinguibles entre sí (`view_audit` / `access_audit`,
 * `access_portal_settings` / `configure_portal`) y otras que decían «editar contenido»
 * sin decir *qué* contenido, que era justo la pregunta que había que responder.
 *
 * ## La regla de las claves de edición
 *
 * `editar.{ambito}.{slug}` — se derivan de las secciones, no se escriben a mano. Eso es
 * lo que permite a `requierePermisoDeSeccion` construir la clave desde `req.params.slug`
 * sin una tabla de traducción, y que añadir una sección sea añadir una línea aquí en vez
 * de acordarse de sembrar una fila.
 */

import { AMBITOS, type Ambito } from './ambito';

/**
 * Secciones editables de cada aplicación.
 *
 * Es el espejo de `COMPONENTES_POR_SLUG` en los dos `puck.config.tsx`: si allí un slug
 * tiene catálogo de bloques, es editable y necesita su permiso. Cuando se añada una
 * sección hay que tocar los dos sitios — el de allí decide qué bloques se pueden poner,
 * el de aquí quién puede ponerlos.
 */
export const SECCIONES_POR_AMBITO: Record<Ambito, string[]> = {
  sitio: ['plantilla', 'inicio'],
  intranet: [
    'plantilla',
    'inicio',
    'tasa',
    'matriz',
    'encuestas-calidad-de-formacion',
    'encuestas-seguimiento-laboral',
  ],
};

/**
 * El slug de la plantilla, que no es una sección más.
 *
 * Editar `inicio` cambia una página. Editar `plantilla` cambia **la cabecera y el pie de
 * todas** las páginas de ese ámbito — es lo que `MarcoSecciones` pinta una sola vez para
 * las cinco secciones de la intranet. Se separa en el catálogo para que el panel pueda
 * agruparlo aparte y nadie lo conceda creyendo que es una sección cualquiera.
 */
export const SLUG_PLANTILLA = 'plantilla';

/** Construye la clave de edición de una sección. Única fuente de ese formato. */
export const claveDeSeccion = (ambito: Ambito, slug: string) => `editar.${ambito}.${slug}`;

/** Grupos con los que el panel organiza el catálogo. El orden es el de la pantalla. */
export const GRUPOS_DE_PERMISO = [
  'acceso',
  'plantilla',
  'secciones-sitio',
  'secciones-intranet',
  'editor',
  'personas',
  'auditoria',
] as const;

export type GrupoDePermiso = (typeof GRUPOS_DE_PERMISO)[number];

export interface PermisoDelCatalogo {
  clave: string;
  /** Cómo se llama en la pantalla. Lo lee una persona; la clave la lee la máquina. */
  etiqueta: string;
  descripcion: string;
  grupo: GrupoDePermiso;
  /**
   * `false` cuando el permiso solo decide qué se pinta y la API no puede comprobarlo.
   *
   * Hoy solo `editor.eliminar-bloques`: el servidor recibe el contenido final y no
   * distingue «borró un bloque» de «guardó una página con menos bloques» sin comparar
   * versiones. Se marca para que el panel pueda decirlo y nadie lo tome por una
   * frontera de seguridad.
   */
  esFrontera: boolean;
}

/** Permisos que no dependen de las secciones. */
const PERMISOS_FIJOS: PermisoDelCatalogo[] = [
  {
    clave: 'acceso.sitio',
    etiqueta: 'Sitio web público',
    descripcion: 'Entrar al sitio con la sesión iniciada.',
    grupo: 'acceso',
    esFrontera: true,
  },
  {
    clave: 'acceso.intranet',
    etiqueta: 'Intranet',
    descripcion: 'Entrar a la intranet y ver su contenido.',
    grupo: 'acceso',
    esFrontera: true,
  },
  {
    clave: 'acceso.panel',
    etiqueta: 'Panel de administración',
    descripcion: 'Entrar a /admin: tablero, usuarios, revisión y configuración.',
    grupo: 'acceso',
    esFrontera: true,
  },
  {
    clave: 'editor.eliminar-bloques',
    etiqueta: 'Eliminar bloques',
    descripcion: 'Quitar bloques de una página en el editor, no solo añadir y reordenar.',
    grupo: 'editor',
    // Ver la nota de `esFrontera`: esto oculta la acción en Puck, no la impide en la API.
    esFrontera: false,
  },
  {
    clave: 'editor.enviar-revision',
    etiqueta: 'Enviar a revisión',
    descripcion: 'Mandar lo editado a la cola de aprobación. Sin esto solo guarda borradores.',
    grupo: 'editor',
    esFrontera: true,
  },
  {
    clave: 'usuarios.crear',
    etiqueta: 'Crear usuarios',
    descripcion: 'Dar de alta cuentas y emitir su contraseña temporal.',
    grupo: 'personas',
    esFrontera: true,
  },
  {
    clave: 'usuarios.editar',
    etiqueta: 'Editar usuarios',
    descripcion: 'Modificar datos, rol, caducidad y restablecer contraseñas de otras cuentas.',
    grupo: 'personas',
    esFrontera: true,
  },
  {
    clave: 'usuarios.eliminar',
    etiqueta: 'Eliminar usuarios',
    descripcion: 'Borrar cuentas del sistema.',
    grupo: 'personas',
    esFrontera: true,
  },
  {
    clave: 'usuarios.permisos',
    etiqueta: 'Gestionar roles y permisos',
    descripcion:
      'Crear roles y decidir qué puede hacer cada uno. Quien tiene esto puede concederse todo lo demás.',
    grupo: 'personas',
    esFrontera: true,
  },
  {
    clave: 'auditoria.ver',
    etiqueta: 'Ver la bitácora',
    descripcion:
      'Consultar quién hizo qué y cuándo. Incluye la IP y el navegador de cada persona.',
    grupo: 'auditoria',
    esFrontera: true,
  },
];

/** Cómo se nombra cada sección en la pantalla. Sin entrada, se usa el slug. */
const ETIQUETAS_DE_SECCION: Record<string, string> = {
  plantilla: 'Menú y pie de página',
  inicio: 'Inicio',
  tasa: 'Tasa de vinculación',
  matriz: 'Matriz de tendencias',
  'encuestas-calidad-de-formacion': 'Encuestas de calidad de la formación',
  'encuestas-seguimiento-laboral': 'Encuestas de seguimiento laboral',
};

const NOMBRE_DE_AMBITO: Record<Ambito, string> = {
  sitio: 'el sitio web',
  intranet: 'la intranet',
};

const permisoDeSeccion = (ambito: Ambito, slug: string): PermisoDelCatalogo => {
  const esPlantilla = slug === SLUG_PLANTILLA;

  return {
    clave: claveDeSeccion(ambito, slug),
    etiqueta: esPlantilla
      ? `Menú y pie de ${NOMBRE_DE_AMBITO[ambito]}`
      : (ETIQUETAS_DE_SECCION[slug] ?? slug),
    descripcion: esPlantilla
      ? `Editar la cabecera y el pie que comparten TODAS las páginas de ${NOMBRE_DE_AMBITO[ambito]}.`
      : `Editar la sección «${ETIQUETAS_DE_SECCION[slug] ?? slug}» de ${NOMBRE_DE_AMBITO[ambito]}.`,
    grupo: esPlantilla ? 'plantilla' : (`secciones-${ambito}` as GrupoDePermiso),
    esFrontera: true,
  };
};

/** El catálogo completo, en el orden en que se pinta. */
export const CATALOGO_PERMISOS: PermisoDelCatalogo[] = [
  ...PERMISOS_FIJOS.filter((p) => p.grupo === 'acceso'),
  ...AMBITOS.map((ambito) => permisoDeSeccion(ambito, SLUG_PLANTILLA)),
  ...AMBITOS.flatMap((ambito) =>
    SECCIONES_POR_AMBITO[ambito]
      .filter((slug) => slug !== SLUG_PLANTILLA)
      .map((slug) => permisoDeSeccion(ambito, slug))
  ),
  ...PERMISOS_FIJOS.filter((p) => p.grupo !== 'acceso'),
];

export const CLAVES_DEL_CATALOGO = CATALOGO_PERMISOS.map((p) => p.clave);

/** Si un slug es editable en su ámbito. Lo usa el middleware antes de exigir permiso. */
export const esSeccionEditable = (ambito: Ambito, slug: string) =>
  SECCIONES_POR_AMBITO[ambito].includes(slug);
