import { Data } from '@puckeditor/core';

export const homeFallbackData: Data = {
  content: [
    {
      type: 'Hero',
      props: {
        id: 'hero-static',
        tituloSeccion: '<p>¿Sabes qué es una<br><strong>ocupación?</strong></p>',
        descripcion:
          '<p>Es un conjunto de cargos, empleos u oficios que incluyen categorías homogéneas de funciones, independientemente del lugar o tiempo donde se desarrollen.</p>',
        titulo:
          '<p><em>Explora las ocupaciones clave de los</em> <strong>sectores productivos en Colombia.</strong></p>',
        searchPlaceholder: 'Buscar ocupación, código o denominación',
        imagenFondo: '',
        transparenciaFondo: '',
        colorFondo: '',
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
        titulo: '<p><strong>Recursos</strong> visuales</p>',
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
        titulo: '<p><strong>Ultimas</strong> publicaciones</p>',
        porPagina: 4,
        publicaciones: [
          {
            titulo: 'Boletín Mercado Laboral — Marzo 2026',
            pdfUrl: '/uploads/BOLETIN%20MERCADO%20LABORAL%20MAR%202026.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Catálogo de Ocupaciones Campesina, Familiar y Comunitaria',
            pdfUrl: '/uploads/Cat%C3%A1logo%20de%20Ocp.%20Campesina%2C%20Familiar%20y%20Comunitaria-1.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Diccionario OLO',
            pdfUrl: '/uploads/DICCIONARIO%20OLO.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Informe Catálogo Economía Popular',
            pdfUrl: '/uploads/Econom%C3%ADa%20Popular.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'La mujer en el Mercado Laboral Colombiano II-2025',
            pdfUrl: '/uploads/La%20mujer%20en%20el%20Mercado%20Laboral%20Colombiano%20II-2025.pdf',
            etiqueta: '#OLOtecuenta',
            mes: 'May',
            dia: '07',
          },
          {
            titulo: 'Vinculación Víctimas II Semestre',
            pdfUrl: '/uploads/VINCULACI%C3%93N%20VICTIMAS%20II-%20SEM.pdf',
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
    },
  ],
  root: {
    props: {},
  },
};
