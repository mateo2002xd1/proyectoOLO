/**
 * Pasa la página de Tasa de la intranet a la base de datos, tal y como está hoy.
 *
 * Hasta ahora era un componente fijo: cambiar el enlace de un tablero de Power BI o
 * la presentación obligaba a tocar código y desplegar. Con el contenido en la base
 * se edita desde el editor visual.
 *
 * Recorre el ciclo editorial normal (borrador → revisión → aprobación) en vez de
 * insertar filas a mano, para que la versión quede registrada como cualquier otra.
 * Es idempotente: volver a ejecutarlo crea una versión nueva con el mismo contenido
 * y archiva la anterior, no duplica la página.
 */
import 'dotenv/config';
import sequelize from '../../src/config/database';
import { guardarBorrador } from '../../src/use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision } from '../../src/use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../../src/use-cases/paginas/aprobar-pagina.usecase';
import { PaginaRepository } from '../../src/repositories/pagina.repository';

const SLUG = 'tasa';
const AMBITO = 'intranet' as const;

/** Un bloque de Puck con su tipo, su id y sus props. */
const bloque = (type: string, id: string, props: Record<string, unknown> = {}) => ({
  type,
  props: { id, ...props },
});

const CONTENIDO = {
  root: { props: {} },
  zones: {},
  content: [
    // La barra de navegación y el pie ya no van aquí: eran una copia por sección
    // y los menús acabaron divergiendo. Ahora viven en la página `plantilla` y los
    // pinta el layout de la intranet. Ver `migrar-plantilla-intranet.ts`.
    bloque('TasaBanner', 'tasa-banner', {
      tituloInicio: 'Tasa de',
      tituloDestacado: 'Vinculación y Empleabilidad',
      imagenSrc: '/assets/img/BannerTasa.png',
      imagenAlt: 'Tasa de Vinculación y Empleabilidad',
    }),
    bloque('TasaConceptos', 'tasa-conceptos', {
      conceptos: [
        {
          titulo: '¿Qué es la Tasa de Vinculación?',
          descripcion:
            'La Tasa de Vinculación consiste en medir cuál es el porcentaje de egresados certificados de formación titulada del SENA de un semestre (cohorte semestral) que logran vincularse a un empleo formal (que presentan aportes a seguridad social en PILA) en el siguiente semestre.',
          imagenSrc: '/assets/img/vinculacion1.png',
          imagenAlt: 'Estadísticas de Tasa de Vinculación',
        },
        {
          titulo: '¿Qué es la Tasa de Empleabilidad?',
          descripcion:
            'La Tasa de Empleabilidad consiste en medir cuál es el porcentaje de egresados certificados de formación complementaria del SENA y de certificados por competencias laborales de un año (cohorte anual) que se encuentran en un trabajo formal (que presentan aportes a seguridad social en PILA) durante algún momento del siguiente año.',
          imagenSrc: '/assets/img/empleabilidad.png',
          imagenAlt: 'Estadísticas de Tasa de Empleabilidad',
        },
      ],
    }),
    bloque('TasaVideo', 'tasa-video', {
      tituloInicio: 'Aquí te contamos todo sobre la estrategia de Tasa de',
      tituloDestacado: 'Vinculación y Empleabilidad',
      videoUrl: 'https://www.youtube.com/embed/4E7Sci4DAVQ',
    }),
    bloque('TasaDashboards', 'tasa-dashboards', {
      tableros: [
        {
          titulo: 'Dashboard OLO - Vinculación',
          descripcion:
            'Resultados de vinculación laboral formal (titulada), con una periodicidad semestral. Genera un indicador de vinculación donde se relaciona el número de vinculados laboralmente en el mercado formal y el total de egresados, para un grupo de seguimiento particular.',
          urlPowerBi:
            'https://app.powerbi.com/view?r=eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9&pageName=ReportSection',
        },
        {
          titulo: 'Dashboard OLO - Empleabilidad',
          descripcion:
            'Resultados de empleabilidad formal (complementaria), con una periodicidad anual. Genera un indicador de empleabilidad donde se relaciona el número de vinculados laboralmente en el mercado formal y el total de egresados, para un grupo de seguimiento particular.',
          urlPowerBi:
            'https://app.powerbi.com/view?r=eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9&pageName=cfd70c690d894046a8d8',
        },
      ],
    }),
    bloque('TasaPresentacion', 'tasa-presentacion', {
      tituloInicio: 'Aquí podrás visualizar nuestra',
      tituloDestacado: 'presentación de Tasa de Vinculación y Empleabilidad',
      archivoUrl: '/uploads/documents/tasa.pptx',
    }),
  ],
};

/** Publica la página de la tasa pasando por borrador, revisión y aprobación. */
const sembrar = async (): Promise<void> => {
  await sequelize.authenticate();

  await guardarBorrador(SLUG, CONTENIDO, '', AMBITO);
  await enviarARevision(SLUG, '', AMBITO, 'Página de la tasa sembrada por script');
  await aprobarPagina(SLUG, '', AMBITO);

  const pagina = await PaginaRepository.findBySlug(SLUG, AMBITO);
  if (!pagina?.versionPublicadaId) {
    throw new Error('La página quedó sin versión publicada.');
  }

  console.log(
    `Página '${SLUG}' (ámbito ${AMBITO}) publicada con ${CONTENIDO.content.length} bloques.`
  );
};

sembrar()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
