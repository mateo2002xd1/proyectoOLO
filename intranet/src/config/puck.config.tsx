'use client';

import { Header } from '@/shared/lib/blocks/Header';
import { Hero } from '@/shared/lib/blocks/Hero';
import { Services } from '@/shared/lib/blocks/Services';
import { ExternalPortals } from '@/shared/lib/blocks/ExternalPortals';
import { Footer } from '@/shared/lib/blocks/Footer';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetHero } from '@/shared/lib/blocks/IntranetHero';
import { TasaBanner } from '@/shared/lib/blocks/TasaBanner';
import { TasaConceptos } from '@/shared/lib/blocks/TasaConceptos';
import { TasaVideo } from '@/shared/lib/blocks/TasaVideo';
import { TasaDashboards } from '@/shared/lib/blocks/TasaDashboards';
import { TasaPresentacion } from '@/shared/lib/blocks/TasaPresentacion';
import { primitiveComponents } from '@olo/blocks-renderer';
import type { Config } from '@puckeditor/core';
import type { ComponentProps } from 'react';
import { ImageUploaderField } from '@/features/paginas/components/image-uploader-field';
import { ArchivoUploaderField } from '@/features/paginas/components/archivo-uploader-field';

/** Props de un componente de Puck. `id` siempre viene inyectado y, al ser
 *  obligatorio, evita que TypeScript trate el tipo como "weak" y rechace el
 *  render por no compartir propiedades con el Config generico. */
type BlockRender<T> = T & { id: string };

// ─── Puck Configuration for Intranet ───
export const puckConfig: Config = {
  categories: {
    'Intranet': {
      components: ['IntranetTopbar', 'IntranetHero'],
    },
    'Tasa de Vinculación': {
      components: [
        'TasaBanner',
        'TasaConceptos',
        'TasaVideo',
        'TasaDashboards',
        'TasaPresentacion',
      ],
    },
    'Navegación': {
      components: ['Header'],
    },
    'Contenido Principal': {
      components: ['Hero', 'Services'],
    },
    'Portales': {
      components: ['ExternalPortals'],
    },
    'Estructura': {
      components: ['Footer', 'IntranetFooter'],
    },
    'Maquetación': {
      components: ['Grid', 'Flex', 'Space'],
    },
  },
  components: {
    // Primitivos de maquetación compartidos (Grid / Flex / Space)
    ...primitiveComponents,
    IntranetTopbar: {
      label: 'Intranet Topbar',
      fields: {
        brandText: { type: 'text', label: 'Texto de la Marca' },
        logoUrl: {
          type: 'custom',
          render: ({ value, onChange }) => (
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
          getItemSummary: (item) => item.label || 'Enlace',
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
      render: (props: BlockRender<ComponentProps<typeof IntranetTopbarWrapper>>) => {
        return <IntranetTopbarWrapper {...props} />;
      },
    },
    IntranetHero: {
      label: 'Intranet Banner Principal',
      fields: {
        imageSrc: {
          type: 'custom',
          render: ({ value, onChange }) => (
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
    // ─── Secciones de Tasa de Vinculación y Empleabilidad ───
    // Cada sección es un bloque suelto para poder reordenarlas arrastrando, y lo
    // que cambia de verdad (textos, enlaces de Power BI, presentación) son campos.
    TasaBanner: {
      label: 'Tasa · Banner',
      fields: {
        tituloInicio: { type: 'text', label: 'Título (primera línea)' },
        tituloDestacado: { type: 'text', label: 'Título en negrita (segunda línea)' },
        imagenSrc: {
          type: 'custom',
          label: 'Ilustración',
          render: ({ value, onChange }) => <ImageUploaderField value={value} onChange={onChange} />,
        },
        imagenAlt: { type: 'text', label: 'Texto alternativo de la imagen' },
      },
      defaultProps: {
        tituloInicio: 'Tasa de',
        tituloDestacado: 'Vinculación y Empleabilidad',
        imagenSrc: '/assets/img/BannerTasa.png',
        imagenAlt: 'Tasa de Vinculación y Empleabilidad',
      },
      render: (props: BlockRender<ComponentProps<typeof TasaBanner>>) => <TasaBanner {...props} />,
    },
    TasaConceptos: {
      label: 'Tasa · Conceptos (zig-zag)',
      fields: {
        conceptos: {
          type: 'array',
          label: 'Conceptos',
          arrayFields: {
            titulo: { type: 'text', label: 'Título' },
            descripcion: { type: 'textarea', label: 'Descripción' },
            imagenSrc: {
              type: 'custom',
              label: 'Imagen',
              render: ({ value, onChange }) => (
                <ImageUploaderField value={value} onChange={onChange} />
              ),
            },
            imagenAlt: { type: 'text', label: 'Texto alternativo' },
          },
          getItemSummary: (item) => item.titulo || 'Concepto',
        },
      },
      defaultProps: {
        conceptos: [
          {
            titulo: '¿Qué es la Tasa de Vinculación?',
            descripcion:
              'La Tasa de Vinculación consiste en medir cuál es el porcentaje de egresados certificados de formación titulada del SENA de un semestre (cohorte semestral) que logran vincularse a un empleo formal (que presentan aportes a seguridad social en PILA) en el siguiente semestre.',
            imagenSrc: '/assets/img/vinculacion.png',
            imagenAlt: 'Estadísticas de Tasa de Vinculación',
          },
          {
            titulo: '¿Qué es la Tasa de Empleabilidad?',
            descripcion:
              'La Tasa de Empleabilidad consiste en medir cuál es el porcentaje de egresados certificados de formación complementaria del SENA y de certificados por competencias laborales de un año (cohorte anual) que se encuentran en un trabajo formal (que presentan aportes a seguridad social en PILA) durante algún momento del siguiente año.',
            imagenSrc: '/assets/img/sabiasque.png',
            imagenAlt: 'Estadísticas de Tasa de Empleabilidad',
          },
        ],
      },
      render: (props: BlockRender<ComponentProps<typeof TasaConceptos>>) => (
        <TasaConceptos {...props} />
      ),
    },
    TasaVideo: {
      label: 'Tasa · Video',
      fields: {
        tituloInicio: { type: 'text', label: 'Título (primera parte)' },
        tituloDestacado: { type: 'text', label: 'Título en negrita' },
        videoUrl: { type: 'text', label: 'Enlace del video de YouTube' },
      },
      defaultProps: {
        tituloInicio: 'Aquí te contamos todo sobre la estrategia de Tasa de',
        tituloDestacado: 'Vinculación y Empleabilidad',
        videoUrl: 'https://www.youtube.com/embed/4E7Sci4DAVQ',
      },
      render: (props: BlockRender<ComponentProps<typeof TasaVideo>>) => <TasaVideo {...props} />,
    },
    TasaDashboards: {
      label: 'Tasa · Tableros Power BI',
      fields: {
        tableros: {
          type: 'array',
          label: 'Tableros',
          arrayFields: {
            titulo: { type: 'text', label: 'Título' },
            descripcion: { type: 'textarea', label: 'Descripción' },
            urlPowerBi: { type: 'text', label: 'Enlace de Power BI (Publicar en la web)' },
          },
          getItemSummary: (item) => item.titulo || 'Tablero',
        },
      },
      defaultProps: {
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
      },
      render: (props: BlockRender<ComponentProps<typeof TasaDashboards>>) => (
        <TasaDashboards {...props} />
      ),
    },
    TasaPresentacion: {
      label: 'Tasa · Presentación',
      fields: {
        tituloInicio: { type: 'text', label: 'Título (primera parte)' },
        tituloDestacado: { type: 'text', label: 'Título en negrita' },
        archivoUrl: {
          type: 'custom',
          label: 'Archivo de presentación',
          render: ({ value, onChange }) => (
            <ArchivoUploaderField
              value={value}
              onChange={onChange}
              accept=".pptx,.ppt"
              etiquetaBoton="Subir presentación"
            />
          ),
        },
      },
      defaultProps: {
        tituloInicio: 'Aquí podrás visualizar nuestra',
        tituloDestacado: 'presentación de Tasa de Vinculación y Empleabilidad',
        archivoUrl: '/uploads/documents/tasa.pptx',
      },
      render: (props: BlockRender<ComponentProps<typeof TasaPresentacion>>) => (
        <TasaPresentacion {...props} />
      ),
    },
    Header: {
      label: 'Header / Encabezado',
      fields: {
        id: { type: 'text' },
        govBannerEnabled: { 
          type: 'radio', 
          label: 'Mostrar franja superior GOV.CO',
          options: [{ label: 'Sí', value: true }, { label: 'No', value: false }] 
        },
      },
      defaultProps: {
        id: 'header-1',
        govBannerEnabled: true,
      },
      render: (props: BlockRender<Omit<ComponentProps<typeof Header>, 'block'>>) => {
        const { id, ...headerProps } = props;
        return <Header block={{ id: id || 'header-preview', type: 'header' }} {...headerProps} />;
      },
    },
    Hero: {
      label: 'Hero / Banner Principal',
      fields: {
        heading: { type: 'textarea', label: 'Título principal' },
      },
      defaultProps: {
        id: 'hero-1',
        heading: 'Intranet OLO',
      },
      render: (props: BlockRender<{ heading?: string }>) => (
        <Hero block={{ id: props.id || 'hero-preview', type: 'hero' }} heading={props.heading} />
      ),
    },
    Services: {
      label: 'Servicios',
      fields: {
        sectionTitle: { type: 'text', label: 'Título' },
      },
      defaultProps: { id: 'services-1', sectionTitle: 'Servicios de la Intranet' },
      render: (props: BlockRender<{ sectionTitle?: string }>) => (
        <Services block={{ id: props.id || 'services-preview', type: 'services' }} sectionTitle={props.sectionTitle} services={[]} />
      ),
    },
    ExternalPortals: {
      label: 'Portales Externos',
      render: () => <ExternalPortals block={{ id: 'portals', type: 'external-portals' }} />,
    },
    Footer: {
      label: 'Footer / Pie de página',
      render: () => <Footer block={{ id: 'footer', type: 'footer' }} />,
    },
    IntranetFooter: {
      label: 'Intranet Footer / Pie de página',
      render: () => <IntranetFooter block={{ id: 'intranet-footer', type: 'IntranetFooter' }} />,
    },
  },
};
