/**
 * Saca la barra de navegación y el pie del contenido de cada sección y los deja
 * en una sola página, `plantilla`.
 *
 * Hasta ahora las cinco secciones de la intranet guardaban su PROPIA copia de los
 * bloques `IntranetTopbar` e `IntranetFooter`. Como cada copia se editaba por
 * separado, cambiar el menú en una sección no cambiaba el de las otras, y con el
 * tiempo divergieron: el desplegable de «Encuestas» solo quedó bien en `/tasa`,
 * porque allí el bloque se sembró sin props —y caían los valores por defecto, que
 * sí lo traen— mientras que aquí se sobrescribía con un menú plano.
 *
 * Este script hace dos cosas:
 *   1. Publica la página `plantilla` con la barra tal como se ve hoy en `/tasa`
 *      (que es la buena) y el pie.
 *   2. Quita esos dos bloques del contenido publicado de las cinco secciones.
 *
 * A partir de ahí las pinta `intranet/src/app/(secciones)/layout.tsx`, una sola
 * vez para todas, y se editan en `/editor/menu-y-pie`.
 *
 * Recorre el ciclo editorial normal (borrador → revisión → aprobación) en vez de
 * tocar filas a mano, para que cada cambio quede registrado como cualquier otro.
 *
 * Es idempotente: la plantilla se vuelve a publicar con el mismo contenido y las
 * secciones que ya estén limpias se saltan sin crear versiones de más.
 *
 *   npm run migrar:plantilla
 */
import 'dotenv/config';
import sequelize from '../src/config/database';
import { guardarBorrador } from '../src/use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision } from '../src/use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../src/use-cases/paginas/aprobar-pagina.usecase';
import { PaginaRepository } from '../src/repositories/pagina.repository';
import { SLUG_PLANTILLA } from '../src/shared/catalogo-permisos';

const AMBITO = 'intranet' as const;

/** Los bloques que dejan de vivir dentro de cada sección. */
const BLOQUES_DE_PLANTILLA = ['IntranetTopbar', 'IntranetFooter'];

const SECCIONES = [
  'inicio',
  'tasa',
  'matriz',
  'encuestas-calidad-de-formacion',
  'encuestas-seguimiento-laboral',
];

interface Bloque {
  type: string;
  props: Record<string, unknown>;
}

interface Contenido {
  root?: Record<string, unknown>;
  zones?: Record<string, Bloque[]>;
  content: Bloque[];
}

/**
 * El menú tal como se ve hoy en `/tasa`: cuatro entradas y «Encuestas»
 * desplegando las dos. Se escribe entero aquí en vez de dejar que caigan los
 * valores por defecto del bloque porque el layout lee estas props directamente
 * de la base, sin pasar por Puck, y Puck es quien rellena los defaults.
 */
const MENU = [
  { href: '/inicio', label: 'Inicio', children: [] },
  { href: '/tasa', label: 'Tasa de Vinculación y Empleabilidad', children: [] },
  { href: '/matriz', label: 'Matriz de Pertinencia', children: [] },
  {
    href: '#',
    label: 'Encuestas',
    children: [
      { href: '/encuestas/calidad-de-formacion', label: 'Calidad de Formación' },
      { href: '/encuestas/seguimiento-laboral', label: 'Seguimiento Laboral' },
    ],
  },
];

/**
 * El pie tal como se ve hoy. Se escribe entero aquí por lo mismo que el menú: el
 * layout lee estas props de la base sin pasar por Puck.
 *
 * Antes el bloque se guardaba SIN props porque su contenido estaba escrito a mano
 * dentro del componente y no había nada que guardar. Ahora es editable, y dejarlo
 * vacío haría que el editor abriera el pie con los campos en blanco aunque en
 * pantalla se viera lleno (los valores por defecto del componente).
 */
const PIE = {
  logos: [
    { src: '/assets/svg/logo-sena.svg', alt: 'Logo SENA', ancho: 56 },
    { src: '/assets/svg/olo-logo-horizontal.svg', alt: 'Logo Observatorio', ancho: 150 },
  ],
  columnas: [
    {
      titulo: 'Observatorio Laboral y Ocupacional SENA',
      lineas: [
        { texto: 'Dirección: Calle 57 No. 8 - 69 Bogotá D.C. (Cundinamarca), Colombia.' },
        { texto: 'Horario de atención: Lunes a viernes de 8:00 am a 5:30 pm' },
        { texto: '@SENACOMUNICA @SENATV', separada: true },
      ],
    },
    {
      titulo: 'Contacto:',
      lineas: [
        { texto: 'PBX (+57) 1 5461500 IP: 13037' },
        { texto: 'olaboryocupacional@sena.edu.co' },
        { texto: 'Política de seguridad y privacidad de la información', url: '#' },
        { texto: 'Política de Tratamiento para Protección de Datos Personales', url: '#' },
        { texto: 'Mapa del sitio', url: '#' },
      ],
    },
  ],
};

const CONTENIDO_PLANTILLA: Contenido = {
  root: { props: {} },
  zones: {},
  content: [
    {
      type: 'IntranetTopbar',
      props: {
        id: 'plantilla-topbar',
        brandText: 'Intranet',
        logoUrl: '/assets/svg/olo-logo-blanco.svg',
        menuItems: MENU,
      },
    },
    { type: 'IntranetFooter', props: { id: 'plantilla-footer', ...PIE } },
  ],
};

/** Publica un contenido pasando por borrador → revisión → aprobación. */
const publicar = async (slug: string, contenido: Contenido): Promise<void> => {
  await guardarBorrador(slug, contenido, '', AMBITO);
  await enviarARevision(slug, AMBITO);
  await aprobarPagina(slug, '', AMBITO);
};

const crearPlantilla = async (): Promise<void> => {
  await publicar(SLUG_PLANTILLA, CONTENIDO_PLANTILLA);

  const guardada = await PaginaRepository.findBySlug(SLUG_PLANTILLA, AMBITO);
  if (!guardada?.versionPublicadaId) {
    throw new Error(`La plantilla quedó sin versión publicada.`);
  }

  console.log(`  ✓ ${SLUG_PLANTILLA} — barra y pie comunes publicados`);
};

const limpiarSeccion = async (slug: string): Promise<void> => {
  const pagina = await PaginaRepository.findBySlug(slug, AMBITO);
  if (!pagina?.versionPublicadaId) {
    console.log(`  · ${slug} — sin versión publicada, no hay nada que limpiar`);
    return;
  }

  const version = await PaginaRepository.findVersionPorId(pagina.versionPublicadaId);
  if (!version) {
    console.log(`  · ${slug} — la versión publicada no existe, se salta`);
    return;
  }

  const contenido = version.contenido as Contenido;
  const bloques = contenido?.content ?? [];
  const limpios = bloques.filter((bloque) => !BLOQUES_DE_PLANTILLA.includes(bloque.type));

  const quitados = bloques.length - limpios.length;
  if (quitados === 0) {
    console.log(`  · ${slug} — ya estaba limpia`);
    return;
  }

  await publicar(slug, { ...contenido, content: limpios });

  console.log(`  ✓ ${slug} — ${quitados} bloque(s) de plantilla quitados`);
};

const migrar = async (): Promise<void> => {
  await sequelize.authenticate();

  console.log(`Plantilla común de la intranet:`);
  await crearPlantilla();

  console.log(`\nQuitando la barra y el pie de ${SECCIONES.length} sección(es):`);
  for (const slug of SECCIONES) {
    await limpiarSeccion(slug);
  }
};

migrar()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
