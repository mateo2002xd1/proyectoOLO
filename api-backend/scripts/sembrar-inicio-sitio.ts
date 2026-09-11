/**
 * Publica la portada del sitio web (`inicio`) con TODO su contenido.
 *
 * ## El problema que resuelve
 *
 * La portada pública se veía completa y el editor no. No era un fallo del editor:
 * en `paginas_versiones` la portada del sitio solo tenía cuatro bloques
 * —`Header`, `Hero`, `ExternalPortals`, `Footer`—, todos en estado `borrador`,
 * **ninguna versión publicada**. Con eso:
 *
 *  - La página pública pedía la versión publicada, no había, y caía en
 *    `homeFallbackData` — los seis bloques escritos en el código. Por eso se veía
 *    entera.
 *  - El editor pedía la versión editable, encontraba ese borrador de cuatro
 *    bloques y lo abría tal cual. Por eso se veía a medias.
 *
 * Las dos cosas eran correctas por separado y contradictorias juntas. Este script
 * pone en la base de datos lo mismo que el visitante ya está viendo, y a partir de
 * ahí la base manda: el fallback deja de usarse y pasa a ser lo que su nombre dice,
 * una red de seguridad por si la API no responde.
 *
 * ## Header y Footer NO van aquí
 *
 * El borrador viejo los llevaba dentro, y es un error que conviene no repetir: la
 * cabecera y el pie los pinta `app/(public)/layout.tsx` leyendo la página
 * `menu-y-pie`. Tenerlos además dentro de la portada los dibujaba dos veces en la
 * página pública, y en el editor salían como «No configuration for Header» porque
 * `configDeEdicion('inicio')` no los ofrece — están reservados a `menu-y-pie`.
 *
 * ## De dónde sale el contenido
 *
 * Es una copia literal de `homeFallbackData`
 * (`sitio-web/src/features/paginas/lib/home-fallback-data.ts`), generada desde ese
 * archivo para que no puedan discrepar. Si se toca el fallback, hay que regenerar
 * esto; y al revés, lo que se edite desde el panel ya no vuelve al fallback.
 *
 * Recorre el ciclo editorial real (borrador → revisión → aprobación) en lugar de
 * insertar filas a mano, igual que `sembrar-plantilla-sitio.ts`: así cada versión
 * queda registrada como cualquier otra y la bitácora de RF-07 no tiene un agujero.
 *
 * Es idempotente: volver a ejecutarlo publica una versión nueva con el mismo
 * contenido y archiva la anterior. No duplica la página ni pierde el historial.
 *
 *   npm run sembrar:inicio:sitio
 */
import 'dotenv/config';
import sequelize from '../src/config/database';
import { guardarBorrador } from '../src/use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision } from '../src/use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../src/use-cases/paginas/aprobar-pagina.usecase';
import { PaginaRepository } from '../src/repositories/pagina.repository';

const AMBITO = 'sitio' as const;
const SLUG = 'inicio';

const CONTENIDO_INICIO = {
    "content": [
      {
        "type": "Hero",
        "props": {
          "id": "hero-static",
          "titulo": "<p><em>Explora las ocupaciones clave de los</em> <strong>sectores productivos en Colombia.</strong></p>",
          "searchPlaceholder": "Buscar ocupación, código o denominación",
          "imageUrl": "/assets/img/nos-ocupa-el-pais.png",
          "imageAlt": "Nos ocupa el país",
          "modelSrc": "/assets/img/modelo-uno.png",
          "modelAlt": "Modelo",
          "colorFondo": ""
        }
      },
      {
        "type": "Services",
        "props": {
          "id": "services-static",
          "sectionTitle": "¿Qué hacemos?",
          "services": [
            {
              "id": "monitoreo",
              "title": "Monitoreo del Mercado",
              "description": "<p>Seguimiento riguroso de fuentes de información laboral nacional</p>"
            },
            {
              "id": "orientacion",
              "title": "Orientación y Formación",
              "description": "<p>Apoyo a la definición de acciones de capacitación, emprendimiento y empleo</p>"
            },
            {
              "id": "alertas",
              "title": "Generación de Alertas",
              "description": "<p>Identificación de proyectos de inversión y alertas regionales y sectoriales</p>"
            }
          ]
        }
      },
      {
        "type": "DatoOloSemana",
        "props": {
          "id": "dato-olo-semana-static",
          "tituloResaltado": "Dato OLO",
          "tituloNormal": "de la semana",
          "imagenSrc": "/assets/img/dato-olo-semana.png",
          "imagenAlt": "Dato OLO de la semana"
        }
      },
      {
        "type": "RecursosVisualesBloque",
        "props": {
          "id": "recursos-visuales-static",
          "titulo": "<p><strong>Recursos</strong> visuales</p>",
          "videos": [
            {
              "youtubeId": "m1h4tcLAmEk",
              "titulo": "#DatoOLO | Con nuestros servicios apoyamos a los colombianos víctimas del conflicto armado en todo el país 🇨🇴",
              "canal": "@SENAComunica"
            },
            {
              "youtubeId": "v2imp4BA-Zg",
              "titulo": "#DatoOLO | ¡Con nosotros te formas para el éxito!",
              "canal": "@SENAComunica"
            },
            {
              "youtubeId": "QjPPzJNR9K0",
              "titulo": "#DatoOLO | ¿Ya estás preparado para OLO te Cuenta 🤔?",
              "canal": "@SENAComunica"
            },
            {
              "youtubeId": "azV9kvP4ikw",
              "titulo": "#DatoOLO | ¡No te pierdas ni un minuto de OLO Te Cuenta!",
              "canal": "@SENAComunica"
            },
            {
              "youtubeId": "emFUHj8dmUo",
              "titulo": "#DatoOLO | ¡Los datos son la base para nuestras decisiones 📈!",
              "canal": "@SENAComunica"
            },
            {
              "youtubeId": "nxtl-XrTV5U",
              "titulo": "#DatoOLO | Los empresarios reconocen que quienes se forman en el SENA tienen capacidades y saberes que benefician sus negocios.",
              "canal": "@SENAComunica"
            }
          ]
        }
      },
      {
        "type": "Publicaciones",
        "props": {
          "id": "publicaciones-static",
          "titulo": "<p><strong>Ultimas</strong> publicaciones</p>",
          "porPagina": 4,
          "publicaciones": [
            {
              "titulo": "Boletín Mercado Laboral — Marzo 2026",
              "pdfUrl": "/uploads/pdf/BOLETIN%20MERCADO%20LABORAL%20MAR%202026.pdf",
              "etiqueta": "#OLOtecuenta",
              "mes": "May",
              "dia": "07"
            },
            {
              "titulo": "Catálogo de Ocupaciones Campesina, Familiar y Comunitaria",
              "pdfUrl": "/uploads/pdf/Cat%C3%A1logo%20de%20Ocp.%20Campesina%2C%20Familiar%20y%20Comunitaria-1.pdf",
              "etiqueta": "#OLOtecuenta",
              "mes": "May",
              "dia": "07"
            },
            {
              "titulo": "Diccionario OLO",
              "pdfUrl": "/uploads/pdf/DICCIONARIO%20OLO.pdf",
              "etiqueta": "#OLOtecuenta",
              "mes": "May",
              "dia": "07"
            },
            {
              "titulo": "Informe Catálogo Economía Popular",
              "pdfUrl": "/uploads/pdf/Econom%C3%ADa%20Popular.pdf",
              "etiqueta": "#OLOtecuenta",
              "mes": "May",
              "dia": "07"
            },
            {
              "titulo": "La mujer en el Mercado Laboral Colombiano II-2025",
              "pdfUrl": "/uploads/pdf/La%20mujer%20en%20el%20Mercado%20Laboral%20Colombiano%20II-2025.pdf",
              "etiqueta": "#OLOtecuenta",
              "mes": "May",
              "dia": "07"
            },
            {
              "titulo": "Vinculación Víctimas II Semestre",
              "pdfUrl": "/uploads/pdf/VINCULACI%C3%93N%20VICTIMAS%20II-%20SEM.pdf",
              "etiqueta": "#OLOtecuenta",
              "mes": "May",
              "dia": "07"
            }
          ]
        }
      },
      {
        "type": "ExternalPortals",
        "props": {
          "id": "portals-static",
          "title": "<p><strong>Portales externos</strong> de la ciudadanía</p>",
          "subtitle": "",
          "portals": [
            {
              "id": "pqrs",
              "label": "PQRS",
              "description": "<p><strong>Registrar tus peticiones, quejas, reclamos y sugerencias</strong>. Tu participación es fundamental para seguir mejorando.</p>",
              "href": "#",
              "imagen": "/assets/img/pqrs.png",
              "colorInicio": "#0b4ea2",
              "colorFin": "#0a2f6b"
            },
            {
              "id": "denuncias",
              "label": "Denuncias por corrupción",
              "description": "<p><strong>Reportar actos de corrupción</strong> por un canal seguro. Tu identidad será protegida en todo momento.</p>",
              "href": "#",
              "imagen": "/assets/img/corrupcion.png",
              "colorInicio": "#0d1526",
              "colorFin": "#1a2e50"
            },
            {
              "id": "transparencia",
              "label": "Transparencia",
              "description": "<p><strong>Consultar información pública</strong> y datos abiertos del observatorio, con rendición de cuentas al día.</p>",
              "href": "#",
              "imagen": "/assets/img/transparencia.png",
              "colorInicio": "#1478c6",
              "colorFin": "#0d4f8b"
            }
          ]
        }
      }
    ],
    "root": {
      "props": {}
    },
    "zones": {}
  };

const publicarInicio = async (): Promise<void> => {
  await guardarBorrador(SLUG, CONTENIDO_INICIO, '', AMBITO);
  await enviarARevision(SLUG, AMBITO);
  await aprobarPagina(SLUG, '', AMBITO);

  const guardada = await PaginaRepository.findBySlug(SLUG, AMBITO);
  if (!guardada?.versionPublicadaId) {
    throw new Error('La portada quedó sin versión publicada.');
  }

  const bloques = CONTENIDO_INICIO.content.map((b) => b.type).join(', ');
  console.log(`  ✓ ${SLUG} — portada publicada con ${CONTENIDO_INICIO.content.length} bloques: ${bloques}`);
};

const sembrar = async (): Promise<void> => {
  await sequelize.authenticate();
  console.log(`Portada del sitio web:`);
  await publicarInicio();
};

sembrar()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
