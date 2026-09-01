'use client';

import type { ComponentProps, ReactNode } from 'react';
import {
  primitiveComponents,
  crearGridConfig,
  conCaja,
  conCajaEnTodos,
  BLOQUES_SIN_CAJA,
  campoColor,
} from '@olo/blocks-renderer';
import { ExternalPortals } from '@/shared/lib/blocks/ExternalPortals';
import { Services } from '@/shared/lib/blocks/Services';
import { DatoOloSemana } from '@/shared/lib/blocks/DatoOloSemana';
import { RecursosVisualesBloque } from '@/shared/lib/blocks/RecursosVisualesBloque';
import { Publicaciones } from '@/shared/lib/blocks/Publicaciones';
import { Header } from '@/shared/lib/blocks/Header';
import { Footer } from '@/shared/lib/blocks/Footer';
import { IntranetTopbar } from '@/shared/lib/blocks/IntranetTopbar';
import { IntranetHero } from '@/shared/lib/blocks/IntranetHero';
import { defaultIdentidadVisual } from '@/features/identidad-visual/client';
import { OcupacionSearchBanner } from '@/shared/ui/molecules/ocupacion-search-banner';
import { EditorjsWrapper } from '@/features/paginas/components/editorjs-wrapper';
import { ImageUploaderField } from '@/features/paginas/components/image-uploader-field';
import { ArchivoUploaderField } from '@/features/paginas/components/archivo-uploader-field';
import { Render, type Config, type Data } from '@puckeditor/core';
import type { OutputData } from '@editorjs/editorjs';

/** Props que Puck inyecta en el render de un campo `custom`. */
type CustomFieldRender<T> = { value: T; onChange: (val: T) => void };

/** Props de un componente de Puck. `id` siempre viene inyectado y, al ser
 *  obligatorio, evita que TypeScript trate el tipo como "weak" y rechace el
 *  render por no compartir propiedades con el Config genérico. */
type BlockRender<T> = T & { id: string };

/**
 * Campo de imagen con subida de archivo, en vez de pedir la URL a mano.
 *
 * Mismo helper que ya tenía la intranet. Aquí el bloque de subida estaba escrito
 * siete veces con el mismo cuerpo, y el Hero ni siquiera lo usaba: pedía la ruta
 * de la imagen en un campo de texto, que obliga a saber dónde vive el archivo y
 * a escribirla sin equivocarse.
 */
const campoImagen = (label: string) => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: CustomFieldRender<string>) => (
    <ImageUploaderField value={value} onChange={onChange} />
  ),
});

// ─── RichText block: Puck handles the layout slot, EditorJS handles the content ───
const RichTextBlock = {
  fields: {
    content: {
      type: 'custom' as const,
      render: ({ value, onChange }: CustomFieldRender<OutputData>) => (
        <EditorjsWrapper data={value} onChange={onChange} />
      ),
    },
  },
  defaultProps: { content: { blocks: [] } },
  render: ({ content }: BlockRender<{ content?: OutputData }>) => (
    <EditorjsWrapper data={content || { blocks: [] }} readOnly />
  ),
};

// ─── Puck Configuration: Single source of truth for editor + public rendering ───
/**
 * El catálogo tal cual lo declara cada bloque.
 *
 * No se exporta: lo que consume la app es el `puckConfig` de más abajo, que es
 * este mismo con los controles de «Espaciado y ancho» ya inyectados.
 */
const puckConfigBase: Config = {
  categories: {
    'Plantilla': {
      components: ['Header', 'Footer'],
    },
    'Intranet': {
      components: ['IntranetTopbar', 'IntranetHero'],
    },
    'Contenido Principal': {
      components: ['Hero', 'Services', 'DatoOloSemana', 'RecursosVisualesBloque', 'Publicaciones', 'RichText'],
    },
    'Portales': {
      components: ['ExternalPortals'],
    },
    'Maquetación': {
      components: ['Grid', 'Flex', 'Space'],
    },
  },
  components: {
    // Primitivos de maquetación compartidos (Flex / Space)
    ...primitiveComponents,
    // Grid necesita el campo de imagen de esta app inyectado (su fondo sube
    // archivos contra la API de sitio-web) — ver `crearGridConfig`.
    Grid: conCaja(crearGridConfig(campoImagen)),
    // ─── Plantilla: la cabecera y el pie que rodean a todas las páginas ───
    // Solo se ofrecen al editar el slug `plantilla` (ver COMPONENTES_POR_SLUG).
    // Los pinta `app/(public)/layout.tsx` leyendo esa página, no el contenido de
    // cada sección: así el menú es uno solo para todo el sitio.
    Header: {
      label: 'Cabecera / Menú',
      fields: {
        govBannerEnabled: {
          type: 'radio',
          label: 'Mostrar franja superior GOV.CO',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        govBannerImageUrl: {
          type: 'custom',
          label: 'Imagen de la franja (opcional)',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
        mainLogoUrl: {
          type: 'custom',
          label: 'Logo principal (opcional)',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
        navLinks: {
          type: 'array',
          label: 'Menú de navegación',
          arrayFields: {
            label: { type: 'text', label: 'Texto del enlace' },
            href: { type: 'text', label: 'URL' },
            active: {
              type: 'radio',
              label: 'Marcar como sección actual',
              options: [
                { label: 'No', value: false },
                { label: 'Sí', value: true },
              ],
            },
            children: {
              type: 'array',
              label: 'Submenú desplegable (opcional)',
              arrayFields: {
                label: { type: 'text', label: 'Texto del enlace' },
                href: { type: 'text', label: 'URL' },
              },
              getItemSummary: (item: { label?: string }) => item.label || 'Enlace',
            },
          },
          getItemSummary: (item: { label?: string }) => item.label || 'Enlace',
        },
        intranetText: { type: 'text', label: 'Texto del botón de intranet' },
        intranetUrl: { type: 'text', label: 'URL de la intranet' },
      },
      // Los mismos valores que sirve `identidad-visual` cuando no hay plantilla:
      // arrastrar el bloque al lienzo da la cabecera que ya se ve hoy, no una vacía.
      defaultProps: { ...defaultIdentidadVisual },
      render: (props: BlockRender<Omit<ComponentProps<typeof Header>, 'block'>>) => (
        <Header {...props} block={{ id: props.id || 'header-preview' }} />
      ),
    },
    Footer: {
      // Sin campos a propósito: el pie todavía tiene su contenido escrito en el
      // JSX, así que aquí solo se decide si aparece o no. Parametrizarlo (como
      // `IntranetFooter` en la intranet) es una tanda aparte.
      label: 'Pie de página',
      render: (props: BlockRender<unknown>) => (
        <Footer block={{ id: props.id || 'footer-preview' }} />
      ),
    },
    IntranetTopbar: {
      label: 'Intranet Topbar',
      fields: {
        brandText: { type: 'text', label: 'Texto de la Marca' },
        alineacionMarca: {
          type: 'object',
          label: 'Posición de la marca (logo + texto)',
          objectFields: {
            horizontal: {
              type: 'radio',
              label: 'Alineación horizontal',
              options: [
                { label: 'Izquierda', value: 'flex-start' },
                { label: 'Centro', value: 'center' },
                { label: 'Derecha', value: 'flex-end' },
              ],
            },
            vertical: {
              type: 'radio',
              label: 'Alineación vertical',
              options: [
                { label: 'Arriba', value: 'flex-start' },
                { label: 'Centro', value: 'center' },
                { label: 'Abajo', value: 'flex-end' },
              ],
            },
          },
        },
        logoUrl: {
          type: 'custom',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
        menuItems: {
          type: 'array',
          label: 'Menú de Navegación',
          arrayFields: {
            label: { type: 'text', label: 'Texto del enlace' },
            href: { type: 'text', label: 'URL' },
          },
          getItemSummary: (item: { label?: string }) => item.label || 'Enlace',
        },
      },
      defaultProps: {
        brandText: 'Intranet',
        // Igual al comportamiento de hoy (`.intranet-brand` en globals.css):
        // fila pegada a la izquierda, centrada verticalmente con el logo.
        alineacionMarca: { horizontal: 'flex-start', vertical: 'center' },
        logoUrl: '/assets/svg/olo-logo-blanco.svg',
        menuItems: [
          { href: "/intranet", label: "Inicio" },
          { href: "#", label: "Tasa de Vinculación y Empleabilidad" },
          { href: "#", label: "Matriz de Pertinencia" },
          { href: "#", label: "Encuestas" },
        ],
      },
      render: (props: BlockRender<ComponentProps<typeof IntranetTopbar>>) => {
        return <IntranetTopbar {...props} />;
      },
    },
    IntranetHero: {
      label: 'Intranet Banner Principal',
      fields: {
        imageSrc: {
          type: 'custom',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
        imageAlt: { type: 'text', label: 'Texto alternativo' },
      },
      defaultProps: {
        imageSrc: '/assets/img/banner1.png',
        imageAlt: 'Banner principal de la intranet',
      },
      render: (props: BlockRender<ComponentProps<typeof IntranetHero>>) => <IntranetHero {...props} />,
    },
    /**
     * Banner de la portada.
     *
     * Tres cosas que el bloque pintaba y el editor no dejaba tocar: el titular
     * —escrito a mano en el JSX de `OcupacionSearchBanner`—, la ilustración de
     * fondo (`modelSrc`) y el color del banner. El JSON guardado llegó a llevar
     * un prop `heading` con la frase del titular, pero no había campo que lo
     * editara ni render que lo leyera: se guardaba y se ignoraba.
     */
    Hero: {
      label: 'Buscador de Ocupaciones (Banner)',
      fields: {
        titulo: {
          type: 'richtext' as const,
          label: 'Titular sobre el buscador',
        },
        searchPlaceholder: {
          type: 'text' as const,
          label: 'Texto de ejemplo dentro del buscador',
        },
        imageUrl: campoImagen('Logo (esquina superior)'),
        imageAlt: {
          type: 'text' as const,
          label: 'Texto alternativo del logo',
        },
        modelSrc: campoImagen('Ilustración de fondo'),
        modelAlt: {
          type: 'text' as const,
          label: 'Texto alternativo de la ilustración',
        },
        // Campo personalizado que integra ColorPickerField para definir el color de fondo del banner 
        // (si se deja vacío, conserva el estilo CSS por defecto).
        colorFondo: campoColor('Color del banner'),
      },
      defaultProps: {
        id: 'hero-1',
        titulo:
          '<p><em>Explora las ocupaciones clave de los</em> <strong>sectores productivos en Colombia.</strong></p>',
        searchPlaceholder: 'Buscar ocupación, código o denominación',
        imageUrl: '/assets/img/nos-ocupa-el-pais.png',
        imageAlt: 'Nos ocupa el país',
        modelSrc: '/assets/img/modelo-uno.png',
        modelAlt: 'Modelo',
        colorFondo: '',
      },
      render: ({
        titulo,
        searchPlaceholder,
        imageUrl,
        imageAlt,
        modelSrc,
        modelAlt,
        colorFondo,
      }: BlockRender<{
        // `ReactNode` y no `string`: Puck convierte los campos `richtext` a nodos
        // antes de llamar al render, igual que en `TextoRico` de la intranet.
        titulo?: ReactNode;
        searchPlaceholder?: string;
        imageUrl?: string;
        imageAlt?: string;
        modelSrc?: string;
        modelAlt?: string;
        colorFondo?: string;
      }>) => (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <OcupacionSearchBanner
            titulo={titulo}
            placeholder={searchPlaceholder}
            logoSrc={imageUrl}
            logoAlt={imageAlt}
            modelSrc={modelSrc}
            modelAlt={modelAlt}
            colorFondo={colorFondo}
          />
        </div>
      ),
    },
    Services: {
      label: 'Servicios',
      fields: {
        sectionTitle: {
          type: 'text' as const,
          label: 'Título de la sección',
        },
        services: {
          type: 'array' as const,
          label: 'Lista de servicios',
          arrayFields: {
            id: { type: 'text' as const, label: 'Identificador' },
            title: { type: 'text' as const, label: 'Título' },
            description: { type: 'richtext' as const, label: 'Descripción' },
          },
          defaultItemProps: {
            id: 'nuevo-servicio',
            title: 'Nuevo servicio',
            description: '<p>Descripción del servicio.</p>',
          },
        },
      },
      defaultProps: {
        id: 'services-1',
        sectionTitle: '¿Qué hacemos?',
        services: [
          {
            id: 'monitoreo',
            title: 'Monitoreo del Mercado',
            description: '<p>Seguimiento riguroso de fuentes de información laboral nacional</p>',
          },
          {
            id: 'orientacion',
            title: 'Orientación y Formación',
            description: '<p>Apoyo a la definición de acciones de capacitación, emprendimiento y empleo</p>',
          },
          {
            id: 'alertas',
            title: 'Generación de Alertas',
            description: '<p>Identificación de proyectos de inversión y alertas regionales y sectoriales</p>',
          },
        ],
      },
      render: ({
        id,
        sectionTitle,
        services,
      }: {
        id: string;
        sectionTitle?: string;
        services?: { id: string; title: string; description: ReactNode }[];
      }) => (
        <Services
          block={{ id: id || 'services-preview' }}
          sectionTitle={sectionTitle}
          services={services}
        />
      ),
    },
    DatoOloSemana: {
      label: 'Dato OLO de la semana',
      fields: {
        tituloResaltado: {
          type: 'text' as const,
          label: 'Título (parte destacada)',
        },
        tituloNormal: {
          type: 'text' as const,
          label: 'Título (resto)',
        },
        imagenSrc: {
          type: 'custom',
          label: 'Infografía del dato',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
        imagenAlt: {
          type: 'text' as const,
          label: 'Texto alternativo de la imagen',
        },
      },
      defaultProps: {
        id: 'dato-olo-semana-1',
        tituloResaltado: 'Dato OLO',
        tituloNormal: 'de la semana',
        imagenSrc: '/assets/img/dato-olo-semana.png',
        imagenAlt: 'Dato OLO de la semana',
      },
      render: ({
        id,
        tituloResaltado,
        tituloNormal,
        imagenSrc,
        imagenAlt,
      }: {
        id: string;
        tituloResaltado?: string;
        tituloNormal?: string;
        imagenSrc?: string;
        imagenAlt?: string;
      }) => (
        <DatoOloSemana
          block={{ id: id || 'dato-olo-semana-preview' }}
          tituloResaltado={tituloResaltado}
          tituloNormal={tituloNormal}
          imagenSrc={imagenSrc}
          imagenAlt={imagenAlt}
        />
      ),
    },
    RecursosVisualesBloque: {
      label: 'Recursos Visuales',
      fields: {
        titulo: { type: 'richtext' as const, label: 'Título' },
        videos: {
          type: 'array' as const,
          label: 'Videos',
          arrayFields: {
            youtubeId: { type: 'text' as const, label: 'Identificador de YouTube (los 11 caracteres)' },
            titulo: { type: 'text' as const, label: 'Título' },
            canal: { type: 'text' as const, label: 'Canal' },
            miniatura: {
              type: 'custom',
              label: 'Miniatura propia (opcional)',
              render: ({ value, onChange }: CustomFieldRender<string>) => (
                <ImageUploaderField value={value} onChange={onChange} />
              ),
            },
          },
          getItemSummary: (item: { titulo?: string }) => item.titulo || 'Video',
        },
      },
      defaultProps: {
        id: 'recursos-visuales-1',
        titulo: '<p><strong>Recursos</strong> visuales</p>',
        videos: [],
      },
      render: ({
        id,
        titulo,
        videos,
      }: BlockRender<{
        titulo?: ReactNode;
        videos?: { youtubeId?: string; titulo?: string; canal?: string; miniatura?: string }[];
      }>) => (
        <RecursosVisualesBloque
          block={{ id: id || 'recursos-visuales-preview' }}
          titulo={titulo}
          videos={videos}
        />
      ),
    },
    Publicaciones: {
      label: 'Últimas publicaciones',
      fields: {
        titulo: { type: 'richtext' as const, label: 'Título' },
        publicaciones: {
          type: 'array' as const,
          label: 'Publicaciones',
          arrayFields: {
            titulo: { type: 'text' as const, label: 'Título' },
            pdfUrl: {
              type: 'custom',
              label: 'Archivo PDF',
              render: ({ value, onChange }: CustomFieldRender<string>) => (
                <ArchivoUploaderField
                  value={value}
                  onChange={onChange}
                  accept=".pdf"
                  etiquetaBoton="Subir PDF"
                />
              ),
            },
            etiqueta: { type: 'text' as const, label: 'Etiqueta (#OLOtecuenta)' },
            mes: { type: 'text' as const, label: 'Mes' },
            dia: { type: 'text' as const, label: 'Día' },
          },
          getItemSummary: (item: { titulo?: string }) => item.titulo || 'Publicación',
        },
        porPagina: { type: 'number' as const, label: 'Tarjetas visibles a la vez', min: 1, max: 6 },
      },
      defaultProps: {
        id: 'publicaciones-1',
        titulo: '<p><strong>Ultimas</strong> publicaciones</p>',
        publicaciones: [],
        porPagina: 4,
      },
      render: ({
        id,
        titulo,
        publicaciones,
        porPagina,
      }: BlockRender<{
        titulo?: ReactNode;
        publicaciones?: { titulo?: string; pdfUrl?: string; etiqueta?: string; mes?: string; dia?: string }[];
        porPagina?: number;
      }>) => (
        <Publicaciones
          block={{ id: id || 'publicaciones-preview' }}
          titulo={titulo}
          publicaciones={publicaciones}
          porPagina={porPagina}
        />
      ),
    },
    ExternalPortals: {
      label: 'Portales Externos',
      fields: {
        title: {
          type: 'richtext' as const,
          label: 'Título de la sección',
        },
        subtitle: {
          type: 'text' as const,
          label: 'Subtítulo (opcional)',
        },
        portals: {
          type: 'array' as const,
          label: 'Lista de portales',
          arrayFields: {
            id: { type: 'text' as const, label: 'Identificador' },
            label: { type: 'text' as const, label: 'Etiqueta' },
            description: { type: 'richtext' as const, label: 'Descripción' },
            href: { type: 'text' as const, label: 'URL de destino' },
            imagen: campoImagen('Ilustración de fondo (se pinta al 60%)'),
            /**
             * El degradado de la tarjeta, en dos colores en vez de una línea de CSS.
             *
             * Antes era un campo de texto donde había que escribir
             * `linear-gradient(135deg, #0b4ea2 0%, #0a2f6b 100%)` a mano: sintaxis
             * de programador en un panel que usa un funcionario, y un paréntesis
             * mal cerrado deja la tarjeta sin fondo sin decir por qué.
             *
             * `gradient` se conserva como respaldo para las tarjetas ya guardadas
             * que todavía no tengan los dos colores; ver `ExternalPortals.tsx`.
             */
            colorInicio: campoColor('Color del degradado · arriba'),
            colorFin: campoColor('Color del degradado · abajo'),
            gradient: { type: 'text' as const, label: 'Degradado CSS (heredado, opcional)' },
          },
          defaultItemProps: {
            id: 'nuevo-portal',
            label: 'Nuevo portal',
            description: '<p>Descripción del portal.</p>',
            href: '#',
            imagen: '',
            colorInicio: '#0b4ea2',
            colorFin: '#0a2f6b',
          },
          getItemSummary: (item: { label?: string }) => item.label || 'Portal',
        },
      },
      defaultProps: {
        id: 'portals-1',
        title: '<p><strong>Portales externos</strong> de la ciudadanía</p>',
        subtitle: '',
        portals: [
          {
            id: 'pqrs',
            label: 'PQRS',
            description:
              '<p><strong>Registrar tus peticiones, quejas, reclamos y sugerencias</strong>. Tu participación es fundamental para seguir mejorando.</p>',
            href: '#',
            imagen: '/assets/img/pqrs.png',
            colorInicio: '#0b4ea2',
            colorFin: '#0a2f6b',
          },
          {
            id: 'denuncias',
            label: 'Denuncias por corrupción',
            description:
              '<p><strong>Reportar actos de corrupción</strong> por un canal seguro. Tu identidad será protegida en todo momento.</p>',
            href: '#',
            imagen: '/assets/img/corrupcion.png',
            colorInicio: '#0d1526',
            colorFin: '#1a2e50',
          },
          {
            id: 'transparencia',
            label: 'Transparencia',
            description:
              '<p><strong>Consultar información pública</strong> y datos abiertos del observatorio, con rendición de cuentas al día.</p>',
            href: '#',
            imagen: '/assets/img/transparencia.png',
            colorInicio: '#1478c6',
            colorFin: '#0d4f8b',
          },
        ],
      },
      render: ({
        id,
        title,
        subtitle,
        portals,
      }: {
        id: string;
        title?: ReactNode;
        subtitle?: string;
        portals?: {
          id: string;
          label: string;
          description: ReactNode;
          href: string;
          gradient?: string;
          colorInicio?: string;
          colorFin?: string;
          imagen?: string;
        }[];
      }) => (
        <ExternalPortals
          block={{ id: id || 'portals-preview' }}
          title={title}
          subtitle={subtitle}
          portals={portals}
        />
      ),
    },
    // Bloque de texto enriquecido — usa EditorJS internamente
    RichText: RichTextBlock,
  },
};

/**
 * El catálogo que usa la app: el de arriba, con los controles de espaciado.
 *
 * Cada bloque gana un grupo «Espaciado y ancho» (relleno, separación con lo de
 * arriba y lo de abajo, ancho máximo y posición) sin tener que declararlo. El
 * envoltorio solo se pinta cuando hay algún valor puesto, así que las páginas ya
 * publicadas producen exactamente el mismo HTML que antes hasta que alguien
 * toque esos campos a propósito.
 *
 * La barra de la intranet queda fuera (`BLOQUES_SIN_CAJA`) porque es
 * `position: sticky`: encerrarla en un div que mide lo mismo que ella la
 * dejaría sin recorrido donde pegarse al hacer scroll.
 */
export const puckConfig: Config = {
  ...puckConfigBase,
  components: conCajaEnTodos(puckConfigBase.components, { excepto: BLOQUES_SIN_CAJA }),
};

/**
 * Qué bloques se ofrecen al editar cada slug.
 *
 * El catálogo es uno solo para todo el sitio, así que sin esto quien edita la
 * portada ve en el selector la cabecera, el pie y los bloques de la intranet,
 * ninguno de los cuales pinta nada ahí. El nombre del bloque es la única pista
 * que tiene, y una lista larga de bloques que no vienen a cuento hace que el
 * editor dé miedo tocarlo.
 *
 * Un slug que no esté aquí recibe el catálogo completo, que es lo razonable
 * cuando no se sabe qué va a contener.
 *
 * `Header` y `Footer` NO están en `inicio`: los pinta `app/(public)/layout.tsx` a
 * partir de la página `plantilla`, y ofrecerlos en una sección dejaría volver a
 * tener una cabecera distinta por página, que es justo lo que se acaba de quitar.
 */
/**
 * La página que guarda la cabecera y el pie comunes.
 *
 * Espejo de `SLUG_PLANTILLA` en `features/paginas/lib/plantilla.ts`. No se importa de
 * allí para no atar el catálogo de bloques a una feature: aquí solo hace falta el
 * literal, y si algún día cambia, cambia en los dos sitios.
 */
const SLUG_DE_PLANTILLA = 'menu-y-pie';

const COMPONENTES_POR_SLUG: Record<string, string[]> = {
  // La plantilla es lo contrario a una página: solo la cabecera y el pie, que es
  // justo lo que las páginas ya no pueden tocar.
  [SLUG_DE_PLANTILLA]: ['Header', 'Footer'],
  inicio: ['Hero', 'Services', 'DatoOloSemana', 'RecursosVisualesBloque', 'Publicaciones', 'ExternalPortals', 'RichText', 'Grid', 'Flex', 'Space'],
};

/**
 * Los slugs que existen sin que nadie los haya creado.
 *
 * Son las claves de `COMPONENTES_POR_SLUG`, y no una lista aparte, porque son lo mismo
 * visto de dos maneras: una sección tiene catálogo recortado precisamente porque el
 * código sabe qué va en ella. Es el espejo de `SECCIONES_POR_AMBITO` en la API, que es
 * quien decide de verdad —aquí solo sirve para no pintar un botón de borrar que la API
 * va a rechazar—.
 */
export const SLUGS_DE_FABRICA = Object.keys(COMPONENTES_POR_SLUG);

/**
 * Si un slug es de fábrica. Las de fábrica no se pueden eliminar: hay código que da por
 * hecho que existen, y borrar `inicio` deja el portal sin portada.
 */
export const esSeccionDeFabrica = (slug: string): boolean => SLUGS_DE_FABRICA.includes(slug);

/**
 * Lo que el lienzo enseña alrededor de lo que se está editando.
 *
 * Son datos YA PUBLICADOS que se pintan de contexto: lo mismo que ve quien visita
 * el sitio. Los resuelve el Server Component del editor y llegan hasta aquí por
 * props — ver `app/admin/editor/[slug]/page.tsx`.
 */
export interface ContextoDeEdicion {
  /** Cabecera y pie publicados. Se usa al editar una página normal. */
  plantilla?: {
    cabecera?: Omit<ComponentProps<typeof Header>, 'block'> | null;
    /** El pie no tiene campos: solo se pone o se quita. */
    pie?: boolean;
  } | null;
  /** Página publicada desde la que se abrió «Menú y pie». */
  seccion?: { slug: string; contenido: unknown } | null;
}

/** El contenido legado se guardaba como array plano; Puck espera `{ content, root }`. */
function datosDePuck(contenido: unknown): Data {
  if (Array.isArray(contenido)) return { content: contenido, root: {} } as Data;
  const objeto = (contenido ?? {}) as { content?: unknown; root?: unknown };
  return { ...objeto, content: objeto.content ?? [], root: objeto.root ?? {} } as Data;
}

/**
 * Envuelve un trozo del lienzo para que se vea pero no se pueda tocar.
 *
 * `inert` es lo que de verdad lo apaga —quita clic, foco y lectura por lectores de
 * pantalla de una vez—; la clase solo lo atenúa para que se note a simple vista
 * cuál es la parte que esta pantalla no edita.
 */
function Inerte({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="olo-chrome-inerte-marco">
      <span className="olo-chrome-inerte-etiqueta">{etiqueta}</span>
      <div className="olo-chrome-inerte" inert>
        {children}
      </div>
    </div>
  );
}

/**
 * Config para la mesa de trabajo de un slug.
 *
 * Hace dos cosas. La primera, de siempre: recortar el catálogo a los bloques que
 * tienen sentido en esta página. La segunda: pintar el RESTO de la página alrededor
 * de lo editable, para poder juzgar un cambio viendo la página entera.
 *
 *  - Editando una página → cabecera y pie publicados, arriba y abajo, inertes.
 *  - Editando `menu-y-pie` → la página publicada de la que se venía, inerte, entre
 *    la cabecera y el pie (que aquí sí son lo editable).
 *
 * Nada de ese contexto entra en `data`: es decorado del config, así que lo que se
 * guarda al pulsar «Guardar borrador» es exactamente lo de antes. Y por eso para
 * PINTAR una página publicada hay que seguir usando `puckConfig` entero: si un
 * bloque guardado no está en la config con la que se renderiza, Puck no sabe
 * dibujarlo y la sección desaparece sin avisar.
 */
export function configDeEdicion(slug: string, contexto: ContextoDeEdicion = {}): Config {
  const permitidos = COMPONENTES_POR_SLUG[slug];

  // Una página creada a mano no está en `COMPONENTES_POR_SLUG` y se queda con el
  // catálogo entero, pero el contexto de abajo le toca igual.
  const recortada: Config = permitidos
    ? {
        ...puckConfig,
        components: Object.fromEntries(
          Object.entries(puckConfig.components).filter(([nombre]) => permitidos.includes(nombre))
        ) as Config['components'],
        categories: Object.fromEntries(
          Object.entries(puckConfig.categories ?? {})
            .map(([nombre, categoria]) => [
              nombre,
              {
                ...categoria,
                components: (categoria.components ?? []).filter((c) => permitidos.includes(c)),
              },
            ])
            // Una categoría que se queda sin bloques no debe salir como grupo vacío.
            .filter(([, categoria]) => (categoria as { components: string[] }).components.length > 0)
        ) as Config['categories'],
      }
    : puckConfig;

  if (slug === SLUG_DE_PLANTILLA) {
    const seccion = contexto.seccion;
    if (!seccion) return recortada;

    /**
     * La página va ENTRE la cabecera y el pie, y `root.render` solo sabe envolver,
     * no intercalar. Así que se cuelga del pie, que es por definición lo último de
     * la página: «justo encima del pie» es donde vive el contenido.
     *
     * Efecto conocido: si alguien borra el bloque del pie mientras edita, el
     * contexto desaparece hasta que lo vuelva a poner.
     */
    const pie = recortada.components.Footer;
    if (!pie) return recortada;

    return {
      ...recortada,
      components: {
        ...recortada.components,
        Footer: {
          ...pie,
          render: (props: Parameters<typeof pie.render>[0]) => (
            <>
              <Inerte etiqueta={`Página /${seccion.slug} · no editable aquí`}>
                <Render config={puckConfig} data={datosDePuck(seccion.contenido)} />
              </Inerte>
              {pie.render(props)}
            </>
          ),
        },
      },
    };
  }

  const plantilla = contexto.plantilla;
  if (!plantilla?.cabecera && !plantilla?.pie) return recortada;

  return {
    ...recortada,
    root: {
      ...recortada.root,
      render: ({ children }: { children?: ReactNode }) => (
        <>
          {plantilla.cabecera && (
            <Inerte etiqueta="Cabecera · se edita en «Menú y pie»">
              <Header block={{ id: 'contexto-header' }} {...plantilla.cabecera} />
            </Inerte>
          )}
          {children}
          {plantilla.pie && (
            <Inerte etiqueta="Pie · se edita en «Menú y pie»">
              <Footer block={{ id: 'contexto-footer' }} />
            </Inerte>
          )}
        </>
      ),
    } as Config['root'],
  };
}
