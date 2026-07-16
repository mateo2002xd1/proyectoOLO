'use client';

import { Header } from '@/lib/blocks/Header';
import { Hero } from '@/lib/blocks/Hero';
import { Services } from '@/lib/blocks/Services';
import { ExternalPortals } from '@/lib/blocks/ExternalPortals';
import { Footer } from '@/lib/blocks/Footer';
import { IntranetTopbarWrapper } from '@/lib/blocks/IntranetTopbarWrapper';
import { IntranetHero } from '@/lib/blocks/IntranetHero';
import type { Config } from '@puckeditor/core';
import { ImageUploaderField } from '@/features/paginas/components/image-uploader-field';

// ─── Puck Configuration for Intranet ───
export const puckConfig: Config = {
  categories: {
    'Intranet': {
      components: ['IntranetTopbar', 'IntranetHero'],
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
          { href: "#", label: "Preguntas Frecuentes" },
        ],
      },
      render: (props: any) => {
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
      },
      defaultProps: {
        id: 'header-1',
        govBannerEnabled: true,
      },
      render: (props: any) => {
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
      render: (props: any) => (
        <Hero block={{ id: props.id || 'hero-preview', type: 'hero' }} heading={props.heading} />
      ),
    },
    Services: {
      label: 'Servicios',
      fields: {
        sectionTitle: { type: 'text', label: 'Título' },
      },
      defaultProps: { id: 'services-1', sectionTitle: 'Servicios de la Intranet' },
      render: (props: any) => (
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
  },
};
