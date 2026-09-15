/**
 * Pasa a la base de datos las secciones de la intranet que aún eran componentes
 * fijos: inicio, matriz y las dos encuestas.
 *
 * Es el mismo procedimiento que `sembrar-pagina-tasa.ts` y por los mismos
 * motivos: cambiar un enlace de Power BI, una presentación o un texto obligaba a
 * tocar código y desplegar. Recorre el ciclo editorial normal (borrador →
 * revisión → aprobación) en vez de insertar filas a mano, para que cada versión
 * quede registrada como cualquier otra.
 *
 * Es idempotente: volver a ejecutarlo crea una versión nueva con el mismo
 * contenido y archiva la anterior, no duplica páginas.
 *
 *   npm run sembrar:intranet            → siembra las cuatro
 *   npm run sembrar:intranet -- matriz  → solo esa
 *
 * Los slugs no llevan barra («encuestas-calidad-de-formacion», no
 * «encuestas/calidad-de-formacion») porque la ruta de la API es `/publica/:slug`
 * y un parámetro de Express no cruza una barra: con slug jerárquico la petición
 * no encontraría la ruta.
 */
import 'dotenv/config';
import sequelize from '../src/config/database';
import { guardarBorrador } from '../src/use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision } from '../src/use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../src/use-cases/paginas/aprobar-pagina.usecase';
import { PaginaRepository } from '../src/repositories/pagina.repository';

const AMBITO = 'intranet' as const;

const bloque = (type: string, id: string, props: Record<string, unknown> = {}) => ({
  type,
  props: { id, ...props },
});

// Aquí había un `MENU` y un helper `topbar()` que ponían una barra de navegación
// —y más abajo un pie— dentro del contenido de cada página. Era una copia por
// sección, editable por separado, así que los menús acabaron divergiendo. Ahora
// la barra y el pie son una sola página, `plantilla`, que pinta el layout de la
// intranet para todas: ver `migrar-plantilla-intranet.ts`.

const PAGINAS: Record<string, { titulo: string; content: ReturnType<typeof bloque>[] }> = {
  // ───────────────────────────── Inicio ─────────────────────────────
  inicio: {
    titulo: 'Inicio',
    content: [
      bloque('IntranetHero', 'inicio-hero', {
        imageSrc: '/assets/img/banner1.png',
        imageAlt: 'Banner principal de la intranet',
      }),
      bloque('SeccionCarrusel', 'inicio-olotecuenta', {
        titulo: '**OLO**tecuenta',
        imagenes: [
          { src: '/assets/img/iniciocar1.png', alt: 'OLO te cuenta 1' },
          { src: '/assets/img/iniciocar2.png', alt: 'OLO te cuenta 2' },
          { src: '/assets/img/iniciocar3.png', alt: 'OLO te cuenta 3' },
          { src: '/assets/img/iniciocar4.png', alt: 'OLO te cuenta 4' },
        ],
        imagenesPorPagina: 1,
        autoplay: true,
        mostrarBotones: false,
        disposicion: 'lado-a-lado',
        fondo: 'gris',
      }),
      bloque('ImagenDestacada', 'inicio-datoolo', {
        titulo: '#dato**OLO**',
        imagenSrc: '/assets/img/imginicioegresados.png',
        imagenAlt: '#datoOLO - Egresados',
        ancho: 'completo',
        fondo: 'gris',
      }),
      bloque('SeccionCarrusel', 'inicio-datoolo-semana', {
        titulo: '#datoOLO de la semana',
        imagenes: [
          { src: '/assets/img/poster1.png', alt: '#datoOLO de la semana 1' },
          { src: '/assets/img/poster2.png', alt: '#datoOLO de la semana 2' },
          { src: '/assets/img/poster4.png', alt: '#datoOLO de la semana 3' },
        ],
        imagenesPorPagina: 2,
        autoplay: true,
        mostrarBotones: true,
        disposicion: 'columna',
        fondo: 'blanco',
      }),
      bloque('RecursosVisualesBloque', 'inicio-recursos', {
        titulo: '**Recursos** visuales',
        videos: [
          {
            youtubeId: '8j0mvTVQi_Y',
            titulo: 'OLO Te Cuenta: Tendencias del mercado laboral en Colombia',
            canal: '@SENAComunica',
            miniatura: '',
          },
          {
            youtubeId: '4E7Sci4DAVQ',
            titulo:
              'Conoce qué es, para qué sirve y cómo te beneficia el Observatorio Laboral y Ocupacional (OLO) SENA.',
            canal: '@SENAComunica',
            miniatura: '',
          },
        ],
      }),
      bloque('Publicaciones', 'inicio-publicaciones', {
        titulo: '**Ultimas** publicaciones',
        porPagina: 4,
        publicaciones: [
          {
            titulo: 'BOLETIN MERCADO LABORAL MAR 2026.pdf',
            pdfUrl: '/uploads/pdf/BOLETIN%20MERCADO%20LABORAL%20MAR%202026.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Guía de usuario SharePoint OLO.pdf',
            pdfUrl: '/uploads/pdf/Gu%C3%ADa%20de%20usuario%20SharePoint%20OLO.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'La mujer en el Mercado Laboral Colombiano II-2025.pdf',
            pdfUrl: '/uploads/pdf/La%20mujer%20en%20el%20Mercado%20Laboral%20Colombiano%20II-2025.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Economía Popular.pdf',
            pdfUrl: '/uploads/pdf/Econom%C3%ADa%20Popular.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Catálogo de Ocp. Campesina, Familiar y Comunitaria-1.pdf',
            pdfUrl:
              '/uploads/pdf/Cat%C3%A1logo%20de%20Ocp.%20Campesina%2C%20Familiar%20y%20Comunitaria-1.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'DICCIONARIO OLO.pdf',
            pdfUrl: '/uploads/pdf/DICCIONARIO%20OLO.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'VINCULACIÓN VICTIMAS II- SEM.pdf',
            pdfUrl: '/uploads/pdf/VINCULACI%C3%93N%20VICTIMAS%20II-%20SEM.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
        ],
      }),
      // Las dos tarjetas se siembran SIN enlace a propósito: en el código tenían
      // `AQUI_VA_LINK_1` y `AQUI_VA_LINK_2`, que no llevan a ninguna parte.
      // Ahora se ven, no engañan, y el enlace se pone desde el editor.
      bloque('PreguntasFrecuentes', 'inicio-preguntas', {
        titulo: '**Preguntas** Frecuentes',
        tarjetas: [
          {
            imagenSrc: '/assets/img/holderpregunta1.png',
            imagenAlt: 'Primera Conferencia 2025',
            texto: 'Ir a respuestas preguntas frecuentes 1ra conferencia OLO',
            url: '',
          },
          {
            imagenSrc: '/assets/img/holderpregunta2.png',
            imagenAlt: 'Segunda Conferencia 2025',
            texto: 'Ir a respuestas preguntas frecuentes 2da conferencia OLO',
            url: '',
          },
        ],
      }),
    ],
  },

  // ───────────────────────────── Matriz ─────────────────────────────
  matriz: {
    titulo: 'Matriz de Pertinencia',
    content: [
      bloque('MatrizBanner', 'matriz-banner', {
        titulo: 'Matriz de \n**PERTINENCIA**',
        imagenSrc: '/assets/img/BannerOficial.png',
        imagenAlt: 'Matriz de Pertinencia',
      }),
      bloque('TextoRico', 'matriz-que-es', {
        titulo: '¿Qué es?',
        contenido:
          '<p>La Matriz de Pertinencia es una herramienta estratégica del SENA, que permite a través de sus 5 variables:</p>' +
          '<ol>' +
          '<li>vinculación laboral.</li>' +
          '<li>tendencia de las ocupaciones.</li>' +
          '<li>demanda social de los programas de oferta titulada.</li>' +
          '<li>sector estratégico de los programas de formación.</li>' +
          '<li>contrato de aprendizaje; comprender que tan bien se ajustan los programas ofrecidos por los centros de formación a la realidad del mercado laboral colombiano.</li>' +
          '</ol>',
        fondo: 'gris',
        ancho: 'estrecho',
      }),
      bloque('ImagenDestacada', 'matriz-sabias-que', {
        titulo: '',
        imagenSrc: '/assets/img/matriz-1.png',
        imagenAlt: 'Sabías que... La Matriz ofrece información desde 2011',
        ancho: 'contenido',
        fondo: 'blanco',
      }),
      bloque('SeccionCarrusel', 'matriz-carrusel', {
        titulo: '',
        imagenes: [
          { src: '/assets/img/Carrusel1.png', alt: 'Matriz de Pertinencia 1' },
          { src: '/assets/img/Carrusel2.png', alt: 'Matriz de Pertinencia 2' },
          { src: '/assets/img/Carrusel3.png', alt: 'Matriz de Pertinencia 3' },
          { src: '/assets/img/Carrusel4.png', alt: 'Matriz de Pertinencia 4' },
          { src: '/assets/img/Carrusel5.png', alt: 'Matriz de Pertinencia 5' },
          { src: '/assets/img/Carrusel6.png', alt: 'Matriz de Pertinencia 6' },
        ],
        imagenesPorPagina: 3,
        autoplay: true,
        mostrarBotones: true,
        disposicion: 'columna',
        fondo: 'blanco',
      }),
      bloque('TasaVideo', 'matriz-video', {
        tituloInicio: '¿Ya sabes como acceder a la matriz de pertinencia en',
        tituloDestacado: '«CompromISO»?',
        videoUrl: 'https://www.youtube.com/embed/4E7Sci4DAVQ',
        descargaTexto: '',
        descargaEtiqueta: 'Descargar',
        descargaUrl: '',
      }),
      bloque('TasaDashboards', 'matriz-tableros', {
        tableros: [
          {
            titulo: 'Dashboard OLO - Matriz',
            descripcion:
              'Resultados de vinculación laboral formal (titulada), con una periodicidad semestral. Genera un indicador de vinculación donde se relaciona el número de vinculados laboralmente en el mercado formal y el total de egresados, para un grupo de seguimiento particular.',
            urlPowerBi:
              'https://app.powerbi.com/view?r=eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9&pageName=ReportSection14c82e0795ad03436073',
          },
        ],
      }),
      // Los dos enlaces estaban como `href="#"`. Se siembran sin URL: se leen,
      // pero no fingen ser pulsables hasta que alguien ponga el destino real.
      bloque('DescargasConPresentacion', 'matriz-descargas', {
        titulo: '**Descargas**',
        enlaces: [
          { etiqueta: 'Matriz de pertinencia 2025', url: '' },
          { etiqueta: 'Matriz de pertinencia 2024', url: '' },
        ],
        archivoUrl: '/uploads/documents/Presentación1.pptx',
      }),
    ],
  },

  // ───────────────── Encuesta · Calidad de la formación ─────────────────
  'encuestas-calidad-de-formacion': {
    titulo: 'Encuesta de Calidad de la Formación',
    content: [
      bloque('EncuestaBanner', 'calidad-banner', {
        antetitulo: 'Encuesta de',
        titulo: 'CALIDAD DE LA FORMACIÓN',
        imagenSrc: '/assets/img/banner-seguimiento-laboral.png',
        imagenAlt: 'Ilustración Calidad de la Formación',
      }),
      bloque('TextoConImagen', 'calidad-objetivo', {
        titulo: '¿Cuál es el **objetivo**?',
        contenido:
          '<p>El objetivo principal es <strong>evaluar la percepción de los empresarios sobre la contribución de los aprendices en sus organizaciones.</strong></p>' +
          '<h3>Puntos Específicos:</h3>' +
          '<ul>' +
          '<li>Conocer las perspectivas de los empresarios frente al <strong>rol de los aprendices</strong> en sus labores.</li>' +
          '<li>Valorar los conocimientos y habilidades <strong>de los aprendices en un contexto laboral real.</strong></li>' +
          '<li><strong>Ofrecer información</strong> sobre la <strong>pertinencia de la formación</strong> de los aprendices respecto a las demandas del mercado laboral.</li>' +
          '<li>Evaluar la disposición de los empresarios a <strong>contratar aprendices</strong> una vez finalizado su periodo de formación.</li>' +
          '</ul>' +
          '<h3><em>¿Qué encontrarás aquí?</em></h3>' +
          '<ul>' +
          '<li>Una <strong>explicación detallada de la metodología de la encuesta</strong> realizada.</li>' +
          '<li>Los <strong>principales resultados</strong> presentados de forma concisa y visual en una <strong>presentación.</strong></li>' +
          '<li>El <strong>conjunto de datos brutos</strong> para que pueda realizar su propia exploración y análisis a profundidad.</li>' +
          '</ul>',
        imagenSrc: '/assets/img/Resultado-de-encuesta.png',
        imagenAlt: 'Resultado de encuesta - Mapa de disponibilidad a contratar',
        pieDeImagen: 'Resultado de encuesta calidad de la Formación',
        ladoImagen: 'derecha',
        fondo: 'gris',
      }),
      bloque('TasaVideo', 'calidad-video', {
        tituloInicio: 'Aquí te contamos todo sobre la',
        tituloDestacado: 'encuesta de calidad de la formación',
        videoUrl: 'https://www.youtube.com/embed/4E7Sci4DAVQ',
        descargaTexto: 'Descarga aquí los datos de la encuesta',
        descargaEtiqueta: 'Descargar',
        descargaUrl: '/uploads/documents/Encuesta Calidad Formación datos.xlsx',
      }),
      bloque('DescargasConPresentacion', 'calidad-portal', {
        titulo: 'Página Web Observatorio Laboral',
        enlaces: [
          { etiqueta: 'Informes', url: '' },
          { etiqueta: 'Resultados', url: '' },
          { etiqueta: 'Boletines Tendencia', url: '' },
        ],
        archivoUrl: '/uploads/documents/Presentación1.pptx',
      }),
    ],
  },

  // ───────────────── Encuesta · Seguimiento laboral ─────────────────
  'encuestas-seguimiento-laboral': {
    titulo: 'Encuesta de Seguimiento Laboral',
    content: [
      bloque('EncuestaBanner', 'seguimiento-banner', {
        antetitulo: 'Encuesta de',
        titulo: 'SEGUIMIENTO LABORAL',
        imagenSrc: '/assets/img/banner-seguimiento-laboral.png',
        imagenAlt: 'Ilustración Seguimiento Laboral',
        imagenDerecha: true,
      }),
      bloque('TextoRico', 'seguimiento-objetivo', {
        titulo: '¿Cuál es el **objetivo**?',
        contenido:
          '<p>Conocer la transición de nuestros egresados después de su certificación y hacer seguimiento un año después a su proceso de vinculación al mercado laboral.</p>' +
          '<h3>Puntos Específicos:</h3>' +
          '<ul>' +
          '<li>Conocer las actividades en que se desempeñaron los egresados el último año.</li>' +
          '<li>Entender en que actividades productivas se encuentran laborando los egresados después de su certificación.</li>' +
          '<li>Saber como el aprendizaje impartido por el SENA ha contribuido a su vida e intereses en general.</li>' +
          '</ul>' +
          '<h3>¿Qué encontrarás aquí?</h3>' +
          '<ul>' +
          '<li>Una <strong>explicación detallada de la metodología de la encuesta</strong> realizada.</li>' +
          '<li>Los <strong>principales resultados</strong> presentados de forma concisa y visual en una <strong>presentación</strong>.</li>' +
          '<li>El <strong>conjunto de datos brutos</strong> para que pueda realizar su propia exploración y análisis a profundidad.</li>' +
          '</ul>',
        fondo: 'gris',
        ancho: 'ancho',
      }),
      bloque('ImagenDestacada', 'seguimiento-resultados-1', {
        titulo: '',
        imagenSrc: '/assets/img/encuesta-seguimiento.png',
        imagenAlt: 'Resultados de la encuesta de seguimiento laboral',
        ancho: 'completo',
        fondo: 'gris',
      }),
      bloque('ImagenDestacada', 'seguimiento-resultados-2', {
        titulo: '',
        imagenSrc: '/assets/img/encuesta-de-seguimiento-laboral-2.png',
        imagenAlt: 'Más resultados de la encuesta de seguimiento laboral',
        ancho: 'completo',
        fondo: 'blanco',
      }),
      bloque('TextoConImagen', 'seguimiento-portal', {
        titulo: 'Portal de aprendizaje',
        contenido:
          '<ul>' +
          '<li>Orientación a los nuevos empleados.</li>' +
          '<li>Rendimiento y desarrollo.</li>' +
          '<li>Habilidades y aprendizaje.</li>' +
          '<li>Promociones.</li>' +
          '<li>Trabajos internos y referencias.</li>' +
          '<li>Herramientas y métodos.</li>' +
          '</ul>',
        imagenSrc: '',
        imagenAlt: '',
        pieDeImagen: '',
        archivoUrl: '/uploads/documents/Presentación1.pptx',
        ladoImagen: 'derecha',
        fondo: 'gris',
      }),
    ],
  },
};

const sembrarUna = async (slug: string): Promise<void> => {
  const pagina = PAGINAS[slug];
  if (!pagina) {
    throw new Error(
      `No hay contenido definido para '${slug}'. Disponibles: ${Object.keys(PAGINAS).join(', ')}`
    );
  }

  const contenido = { root: { props: {} }, zones: {}, content: pagina.content };

  await guardarBorrador(slug, contenido, '', AMBITO);
  await enviarARevision(slug, '', AMBITO);
  await aprobarPagina(slug, '', AMBITO);

  const guardada = await PaginaRepository.findBySlug(slug, AMBITO);
  if (!guardada?.versionPublicadaId) {
    throw new Error(`La página '${slug}' quedó sin versión publicada.`);
  }

  console.log(`  ✓ ${slug} — ${pagina.content.length} bloques publicados`);
};

const sembrar = async (): Promise<void> => {
  await sequelize.authenticate();

  const pedidos = process.argv.slice(2);
  const slugs = pedidos.length > 0 ? pedidos : Object.keys(PAGINAS);

  console.log(`Sembrando ${slugs.length} página(s) en el ámbito '${AMBITO}':`);
  for (const slug of slugs) {
    await sembrarUna(slug);
  }
};

sembrar()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
