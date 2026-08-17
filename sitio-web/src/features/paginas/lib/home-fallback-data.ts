import { Data } from '@puckeditor/core';

export const homeFallbackData: Data = {
  content: [
    {
      type: 'Hero',
      props: {
        id: 'hero-static',
        heading: 'Explora las ocupaciones clave de los sectores productivos en Colombia.',
        searchPlaceholder: 'Buscar ocupación, código o denominación',
        imageUrl: '/assets/img/nos-ocupa-el-pais.png',
        imageAlt: 'Nos ocupa el país',
      },
    },
    {
      type: 'Services',
      props: {
        id: 'services-static',
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
    },
    {
      type: 'DatoOloSemana',
      props: {
        id: 'dato-olo-semana-static',
        tituloResaltado: 'Dato OLO',
        tituloNormal: 'de la semana',
        imagenSrc: '/assets/img/dato-olo-semana.png',
        imagenAlt: 'Dato OLO de la semana',
      },
    },
    {
      type: 'ExternalPortals',
      props: {
        id: 'portals-static',
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
    },
  ],
  root: {
    props: {},
  },
};
