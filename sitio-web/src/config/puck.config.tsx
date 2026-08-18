'use client';

import type { ComponentProps } from 'react';
import {
  primitiveComponents,
  conCajaEnTodos,
  BLOQUES_SIN_CAJA,
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
import type { Config } from '@puckeditor/core';
import type { OutputData } from '@editorjs/editorjs';

/** Props que Puck inyecta en el render de un campo `custom`. */
type CustomFieldRender<T> = { value: T; onChange: (val: T) => void };

/** Props de un componente de Puck. `id` siempre viene inyectado y, al ser
 *  obligatorio, evita que TypeScript trate el tipo como "weak" y rechace el
 *  render por no compartir propiedades con el Config genérico. */
type BlockRender<T> = T & { id: string };

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
    // Primitivos de maquetación compartidos (Grid / Flex / Space)
    ...primitiveComponents,
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
    Hero: {
      label: 'Buscador de Ocupaciones (Banner)',
      fields: {
        searchPlaceholder: {
          type: 'text' as const,
          label: 'Placeholder del buscador',
        },
        imageUrl: {
          type: 'text' as const,
          label: 'URL de la imagen',
        },
        imageAlt: {
          type: 'text' as const,
          label: 'Texto alternativo de la imagen',
        },
      },
      defaultProps: {
        id: 'hero-1',
        searchPlaceholder: 'Buscar ocupación, código o denominación',
        imageUrl: '/assets/img/nos-ocupa-el-pais.png',
        imageAlt: 'Nos ocupa el país',
      },
      render: ({
        searchPlaceholder,
        imageUrl,
        imageAlt,
      }: BlockRender<{
        searchPlaceholder?: string;
        imageUrl?: string;
        imageAlt?: string;
      }>) => (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <OcupacionSearchBanner
            placeholder={searchPlaceholder}
            logoSrc={imageUrl}
            logoAlt={imageAlt}
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
            description: { type: 'textarea' as const, label: 'Descripción' },
          },
          defaultItemProps: {
            id: 'nuevo-servicio',
            title: 'Nuevo servicio',
            description: 'Descripción del servicio.',
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
            description: 'Seguimiento riguroso de fuentes de información laboral nacional',
          },
          {
            id: 'orientacion',
            title: 'Orientación y Formación',
            description: 'Apoyo a la definición de acciones de capacitación, emprendimiento y empleo',
          },
          {
            id: 'alertas',
            title: 'Generación de Alertas',
            description: 'Identificación de proyectos de inversión y alertas regionales y sectoriales',
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
        services?: { id: string; title: string; description: string }[];
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
        titulo: { type: 'text' as const, label: 'Título (usa ** para negrita)' },
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
        titulo: '**Recursos** visuales',
        videos: [],
      },
      render: ({
        id,
        titulo,
        videos,
      }: BlockRender<{
        titulo?: string;
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
        titulo: { type: 'text' as const, label: 'Título (usa ** para negrita)' },
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
        titulo: '**Ultimas** publicaciones',
        publicaciones: [],
        porPagina: 4,
      },
      render: ({
        id,
        titulo,
        publicaciones,
        porPagina,
      }: BlockRender<{
        titulo?: string;
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
          type: 'text' as const,
          label: 'Título de la sección (usa ** para negrita)',
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
            description: { type: 'textarea' as const, label: 'Descripción (usa ** para negrita)' },
            href: { type: 'text' as const, label: 'URL de destino' },
            imagen: {
              type: 'custom',
              label: 'Ilustración de fondo (se pinta al 60%)',
              render: ({ value, onChange }: CustomFieldRender<string>) => (
                <ImageUploaderField value={value} onChange={onChange} />
              ),
            },
            gradient: { type: 'text' as const, label: 'Gradiente CSS' },
          },
          defaultItemProps: {
            id: 'nuevo-portal',
            label: 'Nuevo portal',
            description: 'Descripción del portal.',
            href: '#',
            imagen: '',
            gradient: 'linear-gradient(135deg, #0b4ea2 0%, #0a2f6b 100%)',
          },
          getItemSummary: (item: { label?: string }) => item.label || 'Portal',
        },
      },
      defaultProps: {
        id: 'portals-1',
        title: '**Portales externos** de la ciudadanía',
        subtitle: '',
        portals: [
          {
            id: 'pqrs',
            label: 'PQRS',
            description:
              '**Registrar tus peticiones, quejas, reclamos y sugerencias**. Tu participación es fundamental para seguir mejorando.',
            href: '#',
            imagen: '/assets/img/pqrs.png',
            gradient: 'linear-gradient(135deg, #0b4ea2 0%, #0a2f6b 100%)',
          },
          {
            id: 'denuncias',
            label: 'Denuncias por corrupción',
            description:
              '**Reportar actos de corrupción** por un canal seguro. Tu identidad será protegida en todo momento.',
            href: '#',
            imagen: '/assets/img/corrupcion.png',
            gradient: 'linear-gradient(135deg, #0d1526 0%, #1a2e50 100%)',
          },
          {
            id: 'transparencia',
            label: 'Transparencia',
            description:
              '**Consultar información pública** y datos abiertos del observatorio, con rendición de cuentas al día.',
            href: '#',
            imagen: '/assets/img/transparencia.png',
            gradient: 'linear-gradient(135deg, #1478c6 0%, #0d4f8b 100%)',
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
        title?: string;
        subtitle?: string;
        portals?: {
          id: string;
          label: string;
          description: string;
          href: string;
          gradient: string;
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
const COMPONENTES_POR_SLUG: Record<string, string[]> = {
  // La plantilla es lo contrario a una página: solo la cabecera y el pie, que es
  // justo lo que las páginas ya no pueden tocar.
  plantilla: ['Header', 'Footer'],
  inicio: ['Hero', 'Services', 'DatoOloSemana', 'RecursosVisualesBloque', 'Publicaciones', 'ExternalPortals', 'RichText', 'Grid', 'Flex', 'Space'],
};

/**
 * Config para la mesa de trabajo de un slug.
 *
 * Solo la usa el editor. Para PINTAR una página hay que seguir usando
 * `puckConfig` entero: si un bloque guardado no está en la config con la que se
 * renderiza, Puck no sabe dibujarlo y la sección desaparece sin avisar.
 */
export function configDeEdicion(slug: string): Config {
  const permitidos = COMPONENTES_POR_SLUG[slug];
  if (!permitidos) return puckConfig;

  const components = Object.fromEntries(
    Object.entries(puckConfig.components).filter(([nombre]) => permitidos.includes(nombre))
  ) as Config['components'];

  const categories = Object.fromEntries(
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
  ) as Config['categories'];

  return { ...puckConfig, components, categories };
}
