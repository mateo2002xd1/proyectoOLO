import type { Metadata } from 'next';
import { PaginaPuckFija } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/session';

/**
 * Política de Seguridad, Privacidad y Tratamiento de Datos.
 *
 * Sección de fábrica editable con Puck (ver `SECCIONES_POR_AMBITO.sitio` en
 * `catalogo-permisos.ts`). Tiene carpeta propia en vez de pasar por el comodín
 * `[slug]` para conservar su metadata, más específica que la que daría el comodín
 * (que no define ninguna). El contenido lo pone `PaginaPuckFija` desde la base de datos
 * con el slug `politica-de-privacidad`. Su URL canónica es `/politica-de-privacidad`.
 */
export const metadata: Metadata = {
  title: 'Política de Seguridad y Privacidad de la Información | SENA OLO',
  description:
    'Consulte los lineamientos de seguridad, privacidad de la información, tratamiento y protección de datos personales (Ley 1581 de 2012) y el mapa de procesos institucional del Observatorio Laboral y Ocupacional del SENA.',
};

export default async function PoliticaPrivacidadPage() {
  return <PaginaPuckFija slug="politica-de-privacidad" puedeEditar={await puedeEditarPaginas()} />;
}
