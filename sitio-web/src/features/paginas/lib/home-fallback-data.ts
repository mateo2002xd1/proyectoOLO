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
      type: 'RecursosVisualesBloque',
      props: {
        id: 'recursos-visuales-static',
        titulo: '**Recursos** visuales',
        videos: [
          {
            youtubeId: 'm1h4tcLAmEk',
            titulo:
              '#DatoOLO | Con nuestros servicios apoyamos a los colombianos víctimas del conflicto armado en todo el país 🇨🇴',
            canal: '@SENAComunica',
          },
          {
            youtubeId: 'v2imp4BA-Zg',
            titulo: '#DatoOLO | ¡Con nosotros te formas para el éxito!',
            canal: '@SENAComunica',
          },
          {
            youtubeId: 'QjPPzJNR9K0',
            titulo: '#DatoOLO | ¿Ya estás preparado para OLO te Cuenta 🤔?',
            canal: '@SENAComunica',
          },
          {
            youtubeId: 'azV9kvP4ikw',
            titulo: '#DatoOLO | ¡No te pierdas ni un minuto de OLO Te Cuenta!',
            canal: '@SENAComunica',
          },
          {
            youtubeId: 'emFUHj8dmUo',
            titulo: '#DatoOLO | ¡Los datos son la base para nuestras decisiones 📈!',
            canal: '@SENAComunica',
          },
          {
            youtubeId: 'nxtl-XrTV5U',
            titulo:
              '#DatoOLO | Los empresarios reconocen que quienes se forman en el SENA tienen capacidades y saberes que benefician sus negocios.',
            canal: '@SENAComunica',
          },
        ],
      },
    },
    {
      type: 'Publicaciones',
      props: {
        id: 'publicaciones-static',
        titulo: '**Ultimas** publicaciones',
        porPagina: 4,
        publicaciones: [
          {
            titulo: 'Boletín Mercado Laboral — Marzo 2026',
            pdfUrl: '/upload/BOLETIN%20MERCADO%20LABORAL%20MAR%202026.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Catálogo de Ocupaciones Campesina, Familiar y Comunitaria',
            pdfUrl: '/upload/Cat%C3%A1logo%20de%20Ocp.%20Campesina%2C%20Familiar%20y%20Comunitaria-1.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Diccionario OLO',
            pdfUrl: '/upload/DICCIONARIO%20OLO.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Informe Catálogo Economía Popular',
            pdfUrl: '/upload/Econom%C3%ADa%20Popular.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'La mujer en el Mercado Laboral Colombiano II-2025',
            pdfUrl: '/upload/La%20mujer%20en%20el%20Mercado%20Laboral%20Colombiano%20II-2025.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Vinculación Víctimas II Semestre',
            pdfUrl: '/upload/VINCULACI%C3%93N%20VICTIMAS%20II-%20SEM.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
        ],
      },
    },
    {
      type: 'ExternalPortals',
      props: {
        id: 'portals-static',
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
    },
  ],
  root: {
    props: {},
  },
};
