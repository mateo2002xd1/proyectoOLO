import type { Metadata } from 'next';
import { InicioView } from '@/features/sitio-web/inicio';
import { EditButton, obtenerPaginaInicio } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/session';

/**
 * La portada del sitio.
 *
 * Es la única: `/` redirige aquí (ver `next.config.mjs`). Antes las dos rutas
 * servían este mismo contenido —ambas leen el slug `inicio`— y eso era contenido
 * duplicado bajo dos URLs. Se quedó `/inicio` porque coincide con el slug real
 * que se edita y con la ruta que la intranet usa para su portada.
 *
 * Un segmento estático gana al comodín `[slug]`, así que esta ruta no se resuelve
 * por el catch-all, que habría dado 404 al no encontrar una página con ese slug.
 */
export const metadata: Metadata = {
  title: 'Inicio | Observatorio Laboral y Ocupacional',
  description:
    'Observatorio Laboral y Ocupacional del SENA: monitoreo del mercado laboral, orientación y alertas sectoriales.',
  alternates: { canonical: '/inicio' },
};

export default async function InicioPage() {
  const [data, puedeEditar] = await Promise.all([
    obtenerPaginaInicio(),
    puedeEditarPaginas(),
  ]);

  return (
    <>
      <EditButton slug="inicio" hasPermission={puedeEditar} volverA="/inicio" />
      <InicioView data={data} />
    </>
  );
}
