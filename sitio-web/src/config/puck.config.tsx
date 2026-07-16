'use client';

import { Header } from '@/lib/blocks/Header';
import { Hero } from '@/lib/blocks/Hero';
import { ExternalPortals } from '@/lib/blocks/ExternalPortals';
import { Footer } from '@/lib/blocks/Footer';
import { Services } from '@/lib/blocks/Services';
import { EditorjsWrapper } from '@/features/paginas/components/editorjs-wrapper';
import { IntranetTopbar } from '@/lib/blocks/IntranetTopbar';
import { IntranetHero } from '@/lib/blocks/IntranetHero';
import { ImageUploaderField } from '@/features/paginas/components/image-uploader-field';
import type { Config } from '@puckeditor/core';

// ─── RichText block: Puck handles the layout slot, EditorJS handles the content ───
const RichTextBlock = {
  fields: {
    content: {
      type: 'custom' as const,
      render: ({
        value,
        onChange,
      }: {
        value: any;
        onChange: (val: any) => void;
      }) => <EditorjsWrapper data={value} onChange={onChange} />,
    },
  },
  defaultProps: { content: { blocks: [] } },
  render: (props: any) => (
    <EditorjsWrapper data={props.content || { blocks: [] }} readOnly />
  ),
};

// ─── Puck Configuration: Single source of truth for editor + public rendering ───
export const puckConfig: Config = {
  categories: {
    'Intranet': {
      components: ['IntranetTopbar', 'IntranetHero'],
    },
    'Navegación': {
      components: ['Header'],
    },
    'Contenido Principal': {
      components: ['Hero', 'Services', 'RichText'],
    },
    'Portales': {
      components: ['ExternalPortals'],
    },
    'Estructura': {
      components: ['Footer'],
    },
  },
  components: {
    IntranetTopbar: {
      label: 'Intranet Topbar',
      fields: {
        brandText: { type: 'text', label: 'Texto de la Marca' },
        logoUrl: {
          type: 'custom',
          render: ({ value, onChange }: any) => (
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
          getItemSummary: (item: any) => item.label || 'Enlace',
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
          { href: "#", label: "Preguntas Frecuentes" },
        ],
      },
      render: (props: any) => {
        return <IntranetTopbar {...props} />;
      },
    },
    IntranetHero: {
      label: 'Intranet Banner Principal',
      fields: {
        imageSrc: {
          type: 'custom',
          render: ({ value, onChange }: any) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
        imageAlt: { type: 'text', label: 'Texto alternativo' },
      },
      defaultProps: {
        imageSrc: '/assets/img/banner1.png',
        imageAlt: 'Banner principal de la intranet',
      },
      render: (props: any) => <IntranetHero {...props} />,
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
        govBannerImageUrl: { 
          type: 'text',
          label: 'URL Imagen Banner GOV.CO (Opcional: reemplaza la original)'
        },
        mainLogoUrl: { 
          type: 'text',
          label: 'URL Logo Principal (Opcional: reemplaza el logo SENA)'
        },
        intranetText: { 
          type: 'text',
          label: 'Texto botón intranet'
        },
        intranetUrl: { 
          type: 'text',
          label: 'Enlace botón intranet'
        },
        navLinks: {
          type: 'array',
          label: 'Enlaces de Navegación',
          arrayFields: {
            label: { type: 'text', label: 'Texto del enlace' },
            href: { type: 'text', label: 'URL' },
            active: { type: 'radio', label: 'Activo', options: [{ label: 'Sí', value: true }, { label: 'No', value: false }] },
          },
          getItemSummary: (item) => item.label || 'Enlace',
        },
      },
      render: (props: any) => {
        const { id, ...headerProps } = props;
        return <Header block={{ id: id || 'header-preview', type: 'header' }} {...headerProps} />;
      },
      defaultProps: {
        id: 'header-1',
        govBannerEnabled: true,
        intranetText: 'Intranet',
        intranetUrl: 'http://localhost:3001/login',
        navLinks: [
          { label: 'Inicio', href: '/', active: true },
          { label: 'Clasificaciones', href: '/clasificaciones' },
          { label: 'Tendencias', href: '/tendencias' },
          { label: 'Mercado Laboral', href: '/mercado-laboral' },
          { label: 'Publicaciones', href: '/publicaciones' },
          { label: 'APE', href: '/ape' },
        ],
      },
    },
    Hero: {
      label: 'Hero / Banner Principal',
      fields: {
        heading: {
          type: 'textarea' as const,
          label: 'Título principal',
        },
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
        heading: 'Explora las ocupaciones clave de los sectores productivos en Colombia.',
        searchPlaceholder: 'Buscar ocupación, código o denominación',
        imageUrl: '/asset/img/nos-ocupa-el-pais.png',
        imageAlt: 'Nos ocupa el país',
      },
      render: ({
        id,
        heading,
        searchPlaceholder,
        imageUrl,
        imageAlt,
      }: {
        id: string;
        heading?: string;
        searchPlaceholder?: string;
        imageUrl?: string;
        imageAlt?: string;
      }) => (
        <Hero
          block={{ id: id || 'hero-preview', type: 'hero' }}
          heading={heading}
          searchPlaceholder={searchPlaceholder}
          imageUrl={imageUrl}
          imageAlt={imageAlt}
        />
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
          block={{ id: id || 'services-preview', type: 'services' }}
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
          block={{ id: id || 'portals-preview', type: 'external-portals' }}
          title={title}
          subtitle={subtitle}
          portals={portals}
        />
      ),
    },
    Footer: {
      label: 'Footer / Pie de Página',
      render: ({ id }: { id: string }) => (
        <Footer block={{ id: id || 'footer-preview', type: 'footer' }} />
      ),
      defaultProps: {
        id: 'footer-1',
      },
    },
    // Bloque de texto enriquecido — usa EditorJS internamente
    RichText: RichTextBlock,
  },
};
