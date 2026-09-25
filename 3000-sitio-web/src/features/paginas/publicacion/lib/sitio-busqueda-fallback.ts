import type { PaginaIndiceBusqueda } from '../../model/pagina.types';

/**
 * Respaldo estático para la búsqueda en sitio-web en caso de arranque en frío
 * o desconexión temporal con la API del backend.
 */
export const SITIO_ESTATICO_FALLBACK: PaginaIndiceBusqueda[] = [
  {
    slug: 'inicio',
    titulo: 'Inicio',
    href: '/inicio',
    items: [
      { type: 'h1', text: 'Observatorio Laboral y Ocupacional (OLO)' },
      { type: 'h2', text: '¿Qué hacemos?', blockId: 'services-static' },
      { type: 'p', text: 'Monitoreo del mercado laboral, orientación y generación de alertas.', blockId: 'services-static' },
      { type: 'h2', text: 'Publicaciones y Estudios', blockId: 'publicaciones-static' },
      { type: 'h2', text: 'Catálogo de Ocupaciones Campesina, Familiar y Comunitaria', blockId: 'publicaciones-static' },
      { type: 'h2', text: 'Diccionario OLO', blockId: 'publicaciones-static' },
      { type: 'h2', text: 'Portales externos de la ciudadanía', blockId: 'portals-static' },
      { type: 'p', text: 'Registrar tus peticiones, quejas, reclamos y sugerencias (PQRS).', blockId: 'portals-static' },
      { type: 'p', text: 'Reportar actos de corrupción por un canal seguro.', blockId: 'portals-static' },
      { type: 'p', text: 'Consultar información pública y datos abiertos del observatorio.', blockId: 'portals-static' },
    ],
  },
  {
    slug: 'monitoreo',
    titulo: 'Monitoreo',
    href: '/monitoreo',
    items: [
      { type: 'h1', text: 'Monitoreo del Mercado Laboral' },
      { type: 'h2', text: 'Dinámica de la Ocupación y Empleo en Colombia' },
      { type: 'p', text: 'Información y estadísticas del mercado laboral colombiano.' },
    ],
  },
  {
    slug: 'politica-de-privacidad',
    titulo: 'Políticas de Privacidad y Tratamiento de Datos',
    href: '/inicio/politica-de-privacidad',
    items: [
      { type: 'h1', text: 'Políticas de Seguridad, Privacidad y Tratamiento de Datos' },
      { type: 'h2', text: 'Documentos y Recursos Normativos Oficiales', blockId: 'visor-documentos-static' },
      { type: 'h2', text: 'Política de Seguridad y Privacidad de la Información', blockId: 'visor-documentos-static' },
      { type: 'h2', text: 'Política de Tratamiento para Protección de Datos Personales', blockId: 'visor-documentos-static' },
      { type: 'h2', text: 'Canales de Atención y Ejercicio de Derechos (Habeas Data)', blockId: 'canales-atencion-static' },
      { type: 'span', text: 'Correo Electrónico', blockId: 'canales-atencion-static' },
      { type: 'span', text: 'Línea Gratuita Nacional', blockId: 'canales-atencion-static' },
    ],
  },
];
