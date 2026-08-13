'use client';

import type { ComponentProps } from 'react';
import {
  primitiveComponents,
  conCajaEnTodos,
  BLOQUES_SIN_CAJA,
} from '@olo/blocks-renderer';
import { ExternalPortals } from '@/shared/lib/blocks/ExternalPortals';
import { Services } from '@/shared/lib/blocks/Services';
import { Header } from '@/shared/lib/blocks/Header';
import { Footer } from '@/shared/lib/blocks/Footer';
import { IntranetTopbar } from '@/shared/lib/blocks/IntranetTopbar';
import { IntranetHero } from '@/shared/lib/blocks/IntranetHero';
import { defaultIdentidadVisual } from '@/features/identidad-visual/client';
import { OcupacionSearchBanner } from '@/shared/ui/molecules/ocupacion-search-banner';
import { EditorjsWrapper } from '@/features/paginas/components/editorjs-wrapper';
import { ImageUploaderField } from '@/features/paginas/components/image-uploader-field';
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
      components: ['Hero', 'Services', 'RichText'],
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
            link: { type: 'text' as const, label: 'Texto del enlace' },
          },
          defaultItemProps: {
            id: 'nuevo-servicio',
            title: 'Nuevo servicio',
            description: 'Descripción del servicio.',
            link: 'Ver más',
          },
        },
      },
      defaultProps: {
        id: 'services-1',
        sectionTitle: 'Que hacemos?',
        services: [
          {
            id: 'platform',
            title: 'Plataforma del Observatorio Laboral y Ocupacional',
            description: 'Accede a datos actualizados del mercado laboral colombiano con herramientas interactivas de analisis y visualizacion.',
            link: 'Explorar plataforma',
          },
          {
            id: 'materials',
            title: 'Materiales y publicaciones',
            description: 'Consulta informes, estudios sectoriales y boletines sobre tendencias del empleo y las ocupaciones en el pais.',
            link: 'Ver publicaciones',
          },
          {
            id: 'knowledge',
            title: 'Generacion de conocimiento',
            description: 'Investigacion aplicada y analisis prospectivo sobre las necesidades del mercado laboral y formacion de capital humano.',
            link: 'Conocer mas',
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
        services?: { id: string; title: string; description: string; link: string }[];
      }) => (
        <Services
          block={{ id: id || 'services-preview' }}
          sectionTitle={sectionTitle}
          services={services}
        />
      ),
    },
    ExternalPortals: {
      label: 'Portales Externos',
      fields: {
        title: {
          type: 'text' as const,
          label: 'Título de la sección',
        },
        subtitle: {
          type: 'text' as const,
          label: 'Subtítulo',
        },
        portals: {
          type: 'array' as const,
          label: 'Lista de portales',
          arrayFields: {
            id: { type: 'text' as const, label: 'Identificador' },
            label: { type: 'text' as const, label: 'Etiqueta' },
            description: { type: 'textarea' as const, label: 'Descripción' },
            href: { type: 'text' as const, label: 'URL de destino' },
            gradient: { type: 'text' as const, label: 'Gradiente CSS' },
          },
          defaultItemProps: {
            id: 'nuevo-portal',
            label: 'Nuevo portal',
            description: 'Descripción del portal.',
            href: '#',
            gradient: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
          },
        },
      },
      defaultProps: {
        id: 'portals-1',
        title: 'Portales externos',
        subtitle: 'Accede a los servicios y canales oficiales del gobierno',
        portals: [
          {
            id: 'pqrs',
            label: 'PQRS',
            description: 'Peticiones, quejas, reclamos y sugerencias. Tu opinion es importante para mejorar nuestros servicios.',
            href: '#',
            gradient: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
          },
          {
            id: 'denuncias',
            label: 'Denuncias por corrupcion',
            description: 'Canal seguro para reportar actos de corrupcion. Tu identidad sera protegida.',
            href: '#',
            gradient: 'linear-gradient(135deg, #0d1526 0%, #1a2e50 100%)',
          },
          {
            id: 'transparencia',
            label: 'Transparencia',
            description: 'Acceso a informacion publica, rendicion de cuentas y datos abiertos del observatorio.',
            href: '#',
            gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
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
        portals?: { id: string; label: string; description: string; href: string; gradient: string }[];
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
  inicio: ['Hero', 'Services', 'ExternalPortals', 'RichText', 'Grid', 'Flex', 'Space'],
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
