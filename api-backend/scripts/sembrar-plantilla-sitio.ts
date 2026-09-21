/**
 * Publica la página `plantilla` del sitio web: la cabecera y el pie que rodean
 * a todas las páginas públicas.
 *
 * A diferencia de `migrar-plantilla-intranet.ts`, aquí no hay contenido que
 * extraer de otras páginas — la cabecera y el pie de `sitio-web` nunca fueron
 * bloques Puck por sección, siempre fueron el `Header`/`Footer` fijos que pinta
 * `app/(public)/layout.tsx`. El problema es el opuesto: la gobernanza (RF-05/06)
 * dice que esa cabecera y ese pie se editan como página `plantilla`, con su
 * borrador, su revisión y su aprobación, pero nunca se sembró la primera
 * versión. `obtenerPlantilla()` cae entonces en sus valores por defecto — el
 * sitio público se ve bien porque ese fallback existe — pero el editor
 * (`/editor/menu-y-pie`) y la vista previa abren en blanco: piden la
 * página `plantilla` y la API responde 404, porque la fila no existe.
 *
 * Este script crea esa primera versión con el contenido que ya se ve hoy
 * (`CABECERA_POR_DEFECTO`), para que publicar dejé de ser un requisito
 * silencioso y pase a ser un hecho real en la base de datos.
 *
 * Recorre el ciclo editorial normal (borrador → revisión → aprobación) en vez
 * de insertar filas a mano, por lo mismo que `migrar-plantilla-intranet.ts`:
 * que cada versión quede registrada como cualquier otra.
 *
 * Es idempotente: volver a ejecutarlo publica una versión nueva con el mismo
 * contenido y archiva la anterior: no duplica la página.
 *
 *   npm run sembrar:plantilla:sitio
 */
import 'dotenv/config';
import sequelize from '../src/config/database';
import { guardarBorrador } from '../src/use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision } from '../src/use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../src/use-cases/paginas/aprobar-pagina.usecase';
import { PaginaRepository } from '../src/repositories/pagina.repository';
import { SLUG_PLANTILLA } from '../src/shared/catalogo-permisos';

const AMBITO = 'sitio' as const;

/**
 * Los mismos valores que hoy sirve `CABECERA_POR_DEFECTO`
 * (`sitio-web/src/features/paginas/menu-y-pie/cabecera-por-defecto.ts`),
 * que es lo que `obtenerPlantilla()` usa como cabecera cuando no hay página
 * `plantilla` — es decir, exactamente lo que ya está en pantalla. Sembrar la
 * página con estos valores no cambia nada visible; solo lo vuelve editable.
 */
const CABECERA = {
  id: 'plantilla-header',
  govBannerEnabled: true,
  intranetText: 'Intranet',
  intranetUrl: 'http://localhost:3001',
  navLinks: [
    { label: 'Inicio', href: '/inicio', active: true },
    {
      label: 'Clasificaciones',
      href: '/clasificacion',
      children: [
        { label: 'Clasificación Única de Ocupaciones para Colombia', href: '/clasificacion/cuoc' },
        { label: 'Clasificación Nacional de Ocupaciones', href: '/clasificacion/cno' },
      ],
    },
    { label: 'Tendencias de las Ocupaciones', href: '/tendencias' },
    { label: 'Publicaciones', href: '/publicaciones' },
    { label: 'APE', href: '/ape' },
  ],
};

const PIE = {
  id: 'plantilla-footer',
  logoSenaUrl: '/assets/logos/logo-sena.svg',
  logoSenaAlt: 'Logotipo oficial del SENA con la palabra SENA y simbolo institucional en color verde, presentado en la cabecera del pie de pagina de un sitio gubernamental educativo',
  logoOloUrl: '/assets/logos/olo-logo-horizontal.svg',
  logoOloAlt: 'Logotipo horizontal del Observatorio Laboral y Ocupacional con el texto Observatorio Laboral y Ocupacional, ubicado junto al logo del SENA en la parte superior del pie de pagina',
  logoMintrabajoUrl: '/assets/img/mintrabajo.webp',
  logoMintrabajoAlt: 'Logotipo del Ministerio del Trabajo de Colombia con texto institucional, mostrado en el extremo derecho de la franja superior del pie de pagina en un contexto oficial',

  nombreEntidad: 'Servicio Nacional de Aprendizaje SENA',
  direccion: 'Direccion: Calle 57 No. 8 - 69 Bogota D.C. (Cundinamarca), Colombia.',
  atencionPresencial: 'El SENA brinda a la ciudadania, atencion presencial en las 33 Regionales y 118 Centros de Formacion',
  puntosAtencionTexto: 'Conozca aqui los puntos de atencion',
  puntosAtencionUrl: '#',

  whatsappTitulo: 'Linea de WhatsApp:',
  whatsappNumero: '3112545028',

  lineasAtencionTitulo: 'Lineas de atencion al ciudadanos, empresarios y linea PQRS:',
  lineasAtencionTexto: 'Bogota +(57) 601 736 60 60 - Linea gratuita y resto del pais 018000 910270',

  mesaAyudaTitulo: 'Mesa de ayuda:',
  mesaAyudaTelefono: 'PBX (+57) 1 5461500 IP: 13037',
  mesaAyudaEmail: 'olaboralyocupacional@sena.edu.co',

  horarioTitulo: 'Horario de atencion:',
  horarioTexto: 'Lunes a viernes de 8:00 am a 5:30 pm',

  redesSociales: [
    { red: 'x', nombre: '@SENAComunica', url: 'https://x.com/SENAComunica' },
    { red: 'facebook', nombre: '@SENA', url: 'https://www.facebook.com/SENA/?locale=es_LA' },
    { red: 'instagram', nombre: '@senacomunica', url: 'https://www.instagram.com/senacomunica/?hl=es-la' },
    { red: 'youtube', nombre: '@SENATV', url: 'https://www.youtube.com/@SENAComunica' },
    { red: 'linkedin', nombre: '@SENA', url: 'https://www.linkedin.com/school/servicio-nacional-de-aprendizaje-sena-/posts/?feedView=all' },
    { red: 'radio', nombre: '@senacolombia', url: 'https://sonic.paulatina.co/8176/stream' },
  ],

  certificacionImgUrl: '/assets/img/icontec.png',
  certificacionImgAlt: 'Sello de certificacion ICONTEC con texto de certificacion visible, presentado en la seccion de certificaciones del pie de pagina para transmitir cumplimiento y confianza institucional',

  enlacesFila1: [
    { texto: 'Directorio SENA', url: '#' },
    { texto: 'Chat en linea', url: '#' },
    { texto: 'Notificaciones judiciales', url: '#' },
    { texto: 'Terminos y condiciones del portal web', url: '#' },
  ],
  enlacesFila2: [
    { texto: 'Derechos de autor y/o autorizacion de uso sobre contenidos', url: '#' },
    { texto: 'Politica de Tratamiento para Proteccion de Datos Personales', url: '/inicio/politica-de-privacidad' },
  ],
  enlacesFila3: [
    { texto: 'Mapa del sitio', url: '#' },
    { texto: 'Politica de seguridad y privacidad de la informacion', url: '/inicio/politica-de-privacidad' },
  ],

  mostrarFranjaGov: true,
  rutaCoImgUrl: '/assets/img/ruta-co-colombia.png',
  rutaCoImgAlt: 'Marca pais de Colombia con el texto CO Colombia, ubicada en la franja inferior del sitio junto al distintivo gov para identificar el entorno digital gubernamental',
};

const CONTENIDO_PLANTILLA = {
  root: { props: {} },
  zones: {},
  content: [
    { type: 'Header', props: CABECERA },
    { type: 'Footer', props: PIE },
  ],
};

const publicarPlantilla = async (): Promise<void> => {
  await guardarBorrador(SLUG_PLANTILLA, CONTENIDO_PLANTILLA, '', AMBITO);
  await enviarARevision(SLUG_PLANTILLA, '', AMBITO, 'Cabecera y pie del sitio sembrados por script');
  await aprobarPagina(SLUG_PLANTILLA, '', AMBITO);

  const guardada = await PaginaRepository.findBySlug(SLUG_PLANTILLA, AMBITO);
  if (!guardada?.versionPublicadaId) {
    throw new Error('La plantilla quedó sin versión publicada.');
  }

  console.log(`  ✓ ${SLUG_PLANTILLA} — cabecera y pie del sitio publicados`);
};

const sembrar = async (): Promise<void> => {
  await sequelize.authenticate();

  console.log(`Plantilla común del sitio web:`);
  await publicarPlantilla();
};

sembrar()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
