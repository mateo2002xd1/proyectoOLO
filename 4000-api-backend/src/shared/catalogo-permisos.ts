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
 *
 * **La intranet ya no lista `tasa`, `matriz` ni las dos encuestas** (23-10-2026). Eran de fábrica
 * solo porque nacieron antes que el editor; su contenido y su bloque de cabecera viven en la base
 * y nada del código depende de su slug. Estar aquí les impedía cambiar de dirección: la lista las
 * protege, y renombrarlas dejaba una sección fantasma (`esSeccionConocida` seguía diciendo que sí
 * y el sembrador devolvía su clave vieja). Ahora son páginas como las que se crean desde el editor:
 * su clave `editar.intranet.{slug}` vive mientras exista la página (`sembrar-permisos-roles.ts`) y
 * la crea `sembrar:intranet` con `concederPermisoDeSeccion`. Quedan aquí las que el código nombra.
 */
export const SECCIONES_POR_AMBITO: Record<Ambito, string[]> = {
  sitio: ['menu-y-pie', 'inicio', 'politica-de-privacidad'],
  intranet: ['menu-y-pie', 'inicio'],
};

/**
 * El slug de la plantilla, que no es una sección más.
 *
 * Editar `inicio` cambia una página. Editar `menu-y-pie` cambia **la cabecera y el pie de
 * todas** las páginas de ese ámbito — es lo que `MarcoSecciones` pinta una sola vez para
 * las cinco secciones de la intranet. Se separa en el catálogo para que el panel pueda
 * agruparlo aparte y nadie lo conceda creyendo que es una sección cualquiera.
 *
 * El valor se llamó `plantilla` hasta la migración 014. El concepto sigue siendo ese —una
 * plantilla que envuelve a las demás páginas— pero el slug acaba escrito en la bitácora
 * como campo modificado de cada publicación, y ahí `plantilla` no le decía nada a quien
 * audita. `menu-y-pie` sí. Cambiarlo obliga a tocar también la clave de permiso, porque
 * `claveDeSeccion` la construye desde aquí: ver `014-renombrar-slug-menu-y-pie.ts`.
 */
export const SLUG_PLANTILLA = 'menu-y-pie';

/** Construye la clave de edición de una sección. Única fuente de ese formato. */
export const claveDeSeccion = (ambito: Ambito, slug: string) => `editar.${ambito}.${slug}`;

/**
 * La operación inversa: de `editar.intranet.bolsa-de-empleo` a sus partes.
 *
 * Existe porque desde que las secciones se pueden crear desde el editor, el catálogo
 * estático ya no las conoce todas. Sin esto, la clave de una sección nueva no se
 * distingue de una clave basura: el panel la pintaría como «huérfana» y el sembrador
 * la borraría por no estar en la lista. Devuelve `null` si la clave no tiene esta
 * forma, que es justo lo que hace falta para poder distinguirlas.
 *
 * El slug puede llevar guiones pero **nunca puntos**, así que partir por el tercer
 * punto es seguro: `editar` . `ambito` . `resto`.
 */
export const partesDeClaveDeSeccion = (
  clave: string
): { ambito: Ambito; slug: string } | null => {
  const [prefijo, ambito, ...resto] = clave.split('.');
  if (prefijo !== 'editar' || resto.length === 0) return null;
  if (!AMBITOS.includes(ambito as Ambito)) return null;

  const slug = resto.join('.');
  return slug ? { ambito: ambito as Ambito, slug } : null;
};

/** Grupos con los que el panel organiza el catálogo. El orden es el de la pantalla. */
export const GRUPOS_DE_PERMISO = [
  'acceso',
  'plantilla',
  'secciones-sitio',
  'secciones-intranet',
  'editor',
  'configuracion',
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
    descripcion: 'Entrar a /admin-panel: tablero, usuarios, revisión y configuración.',
    grupo: 'acceso',
    esFrontera: true,
  },

  {
    clave: 'secciones.crear',
    etiqueta: 'Crear páginas nuevas',
    descripcion:
      'Añadir páginas al portal. Cada una estrena una ruta y una clave de permiso, que se concede al rol de quien la crea.',
    grupo: 'editor',
    esFrontera: true,
  },
  {
    clave: 'secciones.eliminar',
    etiqueta: 'Eliminar páginas',
    descripcion:
      'Borrar páginas creadas desde el editor, con su contenido y su historial de versiones. No se puede deshacer. Las páginas del sistema nunca se pueden borrar.',
    grupo: 'editor',
    esFrontera: true,
  },
  {
    clave: 'secciones.cambiar-direccion',
    etiqueta: 'Cambiar la dirección de las páginas',
    descripcion:
      'Cambiar la dirección (/nombre) de una página y actualizar los enlaces del portal que apuntaban a la anterior, incluida la versión publicada y sin pasar por la aprobación. Solo opera para quien aprueba (Superadmin y Administrador). Los enlaces de fuera del portal dejan de funcionar. La portada, «Menú y pie» y las páginas propias del portal no se pueden cambiar.',
    grupo: 'editor',
    esFrontera: true,
  },
  {
    clave: 'configuracion.identidad',
    etiqueta: 'Identidad visual del panel',
    descripcion:
      'Cambiar el logo, el icono y el color de las etiquetas de las acciones. Lo ven todas las personas del panel.',
    grupo: 'configuracion',
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
  'menu-y-pie': 'Menú y pie de página',
  inicio: 'Inicio',
  'politica-de-privacidad': 'Política de privacidad',
  tasa: 'Tasa de vinculación',
  matriz: 'Matriz de tendencias',
  'encuestas-calidad-de-formacion': 'Encuestas de calidad de la formación',
  'encuestas-seguimiento-laboral': 'Encuestas de seguimiento laboral',
};

const NOMBRE_DE_AMBITO: Record<Ambito, string> = {
  sitio: 'el sitio web',
  intranet: 'la intranet',
};

/**
 * El descriptor de catálogo para la clave de edición de una sección.
 *
 * `titulo` lo pasa quien conoce la sección de verdad. Las de fábrica están en
 * `ETIQUETAS_DE_SECCION`, pero una sección creada desde el editor no puede estarlo:
 * su nombre lo escribió alguien y vive en `paginas.titulo`. Sin ese parámetro, el
 * panel enseñaría el slug crudo (`bolsa-de-empleo`) donde debería leerse «Bolsa de
 * empleo», que es exactamente la traducción mental que este catálogo existe para
 * ahorrar.
 */
export const permisoDeSeccion = (
  ambito: Ambito,
  slug: string,
  titulo?: string
): PermisoDelCatalogo => {
  const esPlantilla = slug === SLUG_PLANTILLA;
  const nombre = titulo?.trim() || ETIQUETAS_DE_SECCION[slug] || slug;

  return {
    clave: claveDeSeccion(ambito, slug),
    etiqueta: esPlantilla ? `Menú y pie de ${NOMBRE_DE_AMBITO[ambito]}` : nombre,
    descripcion: esPlantilla
      ? `Editar la cabecera y el pie que comparten TODAS las páginas de ${NOMBRE_DE_AMBITO[ambito]}.`
      : `Editar la página «${nombre}» de ${NOMBRE_DE_AMBITO[ambito]}.`,
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

/**
 * Si un slug es una sección **de fábrica** de ese ámbito.
 *
 * Ojo con usar esto como el portón del editor: desde que se pueden crear secciones
 * desde el propio editor, esta lista ya no es la respuesta completa a «¿existe esta
 * sección?». Lo que quiere saber el middleware es `esSeccionConocida()` de
 * `use-cases/paginas/secciones.usecase.ts`, que mira además la tabla `paginas`.
 *
 * Sigue haciendo falta tal cual para construir el catálogo y para el sembrador: son
 * las secciones que existen sin que nadie las haya creado, y por tanto las únicas
 * cuyas claves de permiso se pueden declarar en código.
 */
export const esSeccionDeFabrica = (ambito: Ambito, slug: string) =>
  SECCIONES_POR_AMBITO[ambito].includes(slug);
