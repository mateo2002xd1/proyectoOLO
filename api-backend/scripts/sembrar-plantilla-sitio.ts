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
 * (`/admin/editor/menu-y-pie`) y la vista previa abren en blanco: piden la
 * página `plantilla` y la API responde 404, porque la fila no existe.
 *
 * Este script crea esa primera versión con el contenido que ya se ve hoy
 * (`defaultIdentidadVisual`), para que publicar dejé de ser un requisito
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
 * Los mismos valores que hoy sirve `defaultIdentidadVisual`
 * (`sitio-web/src/features/identidad-visual/lib/default-identidad-visual.ts`),
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
        { label: 'Clasificación Única de Ocupaciones para Colombia', href: '/clasificacion?tipo=cuoc' },
        { label: 'Clasificación Nacional de Ocupaciones', href: '/clasificacion?tipo=cno' },
      ],
    },
    { label: 'Tendencias de las Ocupaciones', href: '/tendencias' },
    { label: 'Publicaciones', href: '/publicaciones' },
    { label: 'APE', href: '/ape' },
  ],
};

const CONTENIDO_PLANTILLA = {
  root: { props: {} },
  zones: {},
  content: [
    { type: 'Header', props: CABECERA },
    { type: 'Footer', props: { id: 'plantilla-footer' } },
  ],
};

const publicarPlantilla = async (): Promise<void> => {
  await guardarBorrador(SLUG_PLANTILLA, CONTENIDO_PLANTILLA, '', AMBITO);
  await enviarARevision(SLUG_PLANTILLA, AMBITO);
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
